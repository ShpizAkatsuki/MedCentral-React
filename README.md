# MedCentral (React)

```
npm install
npm run dev      # פיתוח
npm run build    # בנייה לתיקיית dist
```

## מבנה
- `src/types.ts` – מודל הנתונים (תואם לגיבויים של הגרסה הישנה, אותו מפתח localStorage).
- `src/lib/` – `utils` (תאריכים, נרמול, מנות), `files` (IndexedDB לקבצים).
- `src/state/store.tsx` – מצב מרכזי, שמירה ל-localStorage, נרמול בטעינה.
- `src/components/` – `ui` (Sheet, Row, Icon…), `RxSheet` (טופס מרשם).
- `src/views/` – Home, Appts, Meds, Docs, More.

## עדיין לא הועבר מהגרסה הישנה
סנכרון Google Drive, לוח שנה, חיפוש כללי, דוח לרופא, תזכורות, Share Target, הורדת ZIP, יומן תסמינים.
