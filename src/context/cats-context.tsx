import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ImagePickerAsset } from 'expo-image-picker';

import {
  createFavourite,
  createVote,
  deleteCatImage,
  deleteFavourite,
  getErrorMessage,
  getFavourites,
  getUploadedCats,
  getVotes,
  hasCatApiKey,
  type CatFavourite,
  type CatVote,
  type UploadedCatImage,
  uploadCatImage,
} from '@/lib/cat-api';

export type CatGalleryItem = UploadedCatImage & {
  favouriteId?: number;
  score: number;
  upVotes: number;
  downVotes: number;
};

export type CatBusyState = {
  delete?: boolean;
  favourite?: boolean;
  voteDown?: boolean;
  voteUp?: boolean;
};

type CatsContextValue = {
  cats: CatGalleryItem[];
  error: string | null;
  isConfigured: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  isUploading: boolean;
  busyImageIds: Record<string, CatBusyState>;
  deleteCat: (imageId: string) => Promise<void>;
  reload: () => Promise<void>;
  toggleFavourite: (cat: CatGalleryItem) => Promise<void>;
  uploadCat: (asset: ImagePickerAsset) => Promise<void>;
  vote: (imageId: string, value: 1 | 0) => Promise<void>;
};

const CatsContext = createContext<CatsContextValue | null>(null);

async function fetchSnapshot() {
  const [images, favourites, votes] = await Promise.all([
    getUploadedCats(),
    getFavourites(),
    getVotes(),
  ]);

  return { images, favourites, votes };
}

export function CatsProvider({ children }: PropsWithChildren) {
  const [images, setImages] = useState<UploadedCatImage[]>([]);
  const [favourites, setFavourites] = useState<CatFavourite[]>([]);
  const [votes, setVotes] = useState<CatVote[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [busyImageIds, setBusyImageIds] = useState<Record<string, CatBusyState>>({});
  const isConfigured = hasCatApiKey();

  function applySnapshot(snapshot: {
    images: UploadedCatImage[];
    favourites: CatFavourite[];
    votes: CatVote[];
  }) {
    setImages(snapshot.images);
    setFavourites(snapshot.favourites);
    setVotes(snapshot.votes);
  }

  function setBusyState(imageId: string, key: keyof CatBusyState, value: boolean) {
    setBusyImageIds((currentBusyIds) => {
      const currentState = currentBusyIds[imageId] ?? {};
      const nextState = { ...currentState, [key]: value };

      if (!nextState.delete && !nextState.favourite && !nextState.voteDown && !nextState.voteUp) {
        const nextBusyIds = { ...currentBusyIds };
        delete nextBusyIds[imageId];
        return nextBusyIds;
      }

      return {
        ...currentBusyIds,
        [imageId]: nextState,
      };
    });
  }

  useEffect(() => {
    let isMounted = true;

    if (!isConfigured) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    async function loadInitialState() {
      setError(null);

      try {
        const snapshot = await fetchSnapshot();
        if (!isMounted) {
          return;
        }

        applySnapshot(snapshot);
      } catch (nextError) {
        if (isMounted) {
          setError(getErrorMessage(nextError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialState();

    return () => {
      isMounted = false;
    };
  }, [isConfigured]);

  async function reload() {
    if (!isConfigured) {
      return;
    }

    setError(null);
    setIsRefreshing(true);

    try {
      const snapshot = await fetchSnapshot();
      applySnapshot(snapshot);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsRefreshing(false);
    }
  }

  async function uploadCat(asset: ImagePickerAsset) {
    setIsUploading(true);

    try {
      const uploadedImage = await uploadCatImage(asset);
      setImages((currentImages) => [uploadedImage, ...currentImages]);
    } catch (nextError) {
      throw nextError;
    } finally {
      setIsUploading(false);
    }
  }

  async function toggleFavourite(cat: CatGalleryItem) {
    setBusyState(cat.id, 'favourite', true);

    try {
      if (cat.favouriteId) {
        await deleteFavourite(cat.favouriteId);
        setFavourites((currentFavourites) =>
          currentFavourites.filter((favourite) => favourite.id !== cat.favouriteId)
        );
        return;
      }

      const newFavourite = await createFavourite(cat.id);
      setFavourites((currentFavourites) => [newFavourite, ...currentFavourites]);
    } catch (nextError) {
      throw nextError;
    } finally {
      setBusyState(cat.id, 'favourite', false);
    }
  }

  async function deleteCat(imageId: string) {
    setBusyState(imageId, 'delete', true);

    try {
      await deleteCatImage(imageId);
      setImages((currentImages) => currentImages.filter((image) => image.id !== imageId));
      setFavourites((currentFavourites) =>
        currentFavourites.filter((favourite) => favourite.image_id !== imageId)
      );
      setVotes((currentVotes) => currentVotes.filter((voteItem) => voteItem.image_id !== imageId));
    } catch (nextError) {
      throw nextError;
    } finally {
      setBusyState(imageId, 'delete', false);
    }
  }

  async function vote(imageId: string, value: 1 | 0) {
    setBusyState(imageId, value === 1 ? 'voteUp' : 'voteDown', true);

    try {
      const newVote = await createVote(imageId, value);
      setVotes((currentVotes) => [newVote, ...currentVotes]);
    } catch (nextError) {
      throw nextError;
    } finally {
      setBusyState(imageId, value === 1 ? 'voteUp' : 'voteDown', false);
    }
  }

  const voteTotals = new Map<
    string,
    {
      score: number;
      upVotes: number;
      downVotes: number;
    }
  >();

  votes.forEach((voteItem) => {
    const currentScore = voteTotals.get(voteItem.image_id) ?? {
      score: 0,
      upVotes: 0,
      downVotes: 0,
    };

    if (voteItem.value > 0) {
      currentScore.score += 1;
      currentScore.upVotes += 1;
    } else {
      currentScore.score -= 1;
      currentScore.downVotes += 1;
    }

    voteTotals.set(voteItem.image_id, currentScore);
  });

  const favouriteIds = new Map(favourites.map((favourite) => [favourite.image_id, favourite.id]));

  const cats: CatGalleryItem[] = images.map((imageItem) => {
    const totals = voteTotals.get(imageItem.id);

    return {
      ...imageItem,
      favouriteId: favouriteIds.get(imageItem.id),
      score: totals?.score ?? 0,
      upVotes: totals?.upVotes ?? 0,
      downVotes: totals?.downVotes ?? 0,
    };
  });

  return (
    <CatsContext.Provider
      value={{
        cats,
        error,
        isConfigured,
        isLoading,
        isRefreshing,
        isUploading,
        busyImageIds,
        deleteCat,
        reload,
        toggleFavourite,
        uploadCat,
        vote,
      }}>
      {children}
    </CatsContext.Provider>
  );
}

export function useCats() {
  const context = useContext(CatsContext);

  if (!context) {
    throw new Error('useCats must be used inside CatsProvider.');
  }

  return context;
}
