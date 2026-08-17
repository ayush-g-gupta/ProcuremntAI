# v10 fixes

- Restored the working Capgemini AI response rendering path.
- Inventory page reuses the latest successful agent result from sessionStorage.
- Dashboard no longer uses fixed inventory fallback values.
- Dashboard loads `/api/inventory` and selects the highest-priority inventory snapshot
  using the same deterministic risk signals as the backend.
- Dashboard still sends the selected SKU to `/api/inventory/check` and navigates to
  `/recommendation`, preserving the original procurement flow.
- Fixed the accidental JSX/string corruption introduced in the previous dashboard edit.
- Dashboard stakeholder name remains Sophie Anderson.
