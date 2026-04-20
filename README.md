# Catboard

Catboard is an Expo app built for the front-end challenge using [The Cat API](https://developers.thecatapi.com/).

It supports:
- uploading a cat image
- listing uploaded cat images
- favouriting and unfavouriting a cat
- voting a cat up or down
- showing a score for each cat
- deleting an uploaded cat image

## Tech Stack

- Expo SDK 55
- Expo Router
- React Native + TypeScript
- NativeWind
- `expo-image-picker`
- The Cat API

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_CAT_API_KEY=your_api_key
EXPO_PUBLIC_CAT_SUB_ID=frontend-challenge-expo
```

`EXPO_PUBLIC_CAT_SUB_ID` is optional. If you do not set it, the app uses `frontend-challenge-expo`.

3. Start the app:

```bash
npm start
```

You can also run:

```bash
npm run ios
npm run android
npm run web
```

## What The App Does

### `/`

The home screen:
- fetches uploaded images from `/images`
- fetches favourites from `/favourites`
- fetches votes from `/votes`
- combines that data into a single gallery view
- lets the user favourite, unfavourite, vote, and delete

The score for each cat is:

```text
up votes - down votes
```

### `/upload`

The upload screen:
- opens the image library
- previews the selected image
- uploads it with `/images/upload`
- returns to `/` after a successful upload
- shows validation and API errors if upload fails

## Project Structure

```text
src/
  app/
    _layout.tsx
    index.tsx
    upload.tsx
  components/
    app-button.tsx
    app-frame.tsx
    cat-card.tsx
    notice-banner.tsx
  context/
    cats-context.tsx
  lib/
    cat-api.ts
    cn.ts
```

## Implementation Notes

- API calls live in `src/lib/cat-api.ts`
- shared app state lives in `src/context/cats-context.tsx`
- the UI is split into just two screens and a few small reusable components
- styling is done with NativeWind