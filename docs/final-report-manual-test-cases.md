# Kovex ERP - Final Report Manual Test Cases

Date: 2026-06-05
Mode: Manual verification for final report documentation

## Summary

These manual test cases document the main user-facing workflows and quality checks used for the final report. Each case records the test name, input, expected result, actual result, and status.

| Test Name | Input | Expected Result | Actual Result | Status |
| --- | --- | --- | --- | --- |
| Login with valid user | Valid email and password on the login page | User is authenticated and redirected to the dashboard | User reaches the dashboard successfully | PASS |
| Dashboard summary loads | Open the dashboard after login | Business summary cards and overview data are visible | Dashboard summary content is displayed | PASS |
| Customer list search and filter | Search text entered in the customers page list controls | Customer table updates to matching results | Customer table responds to the entered search text | PASS |
| Product creation validation | Submit product form with missing required fields | Validation prevents submission and shows required field feedback | Required field validation is shown before saving | PASS |
| Sales report date filter | Select a date range on the sales report page | Sales report refreshes using the selected date range | Sales report data updates for the selected filters | PASS |
| Inventory report export | Choose export format from inventory report actions | Inventory report file is generated in the selected format | Export action produces the requested report file | PASS |
| Language switch | Change the active language from the header dropdown | Interface labels update to the selected language | Visible navigation and page labels change language | PASS |
| Theme toggle | Toggle between light and dark theme from the header | Application theme changes without losing current page state | Theme changes while the current page remains open | PASS |
| Unauthorized route protection | Open a restricted route without required permission | User is blocked or redirected to the forbidden page | Restricted access is prevented | PASS |
| Production build verification | Run the production build command | Frontend and backend builds complete successfully | Build verification completed successfully | PASS |

## Conclusion

The documented manual test cases cover authentication, dashboard visibility, list controls, form validation, reports, export behavior, localization, theme behavior, authorization, and production readiness for the final report.
