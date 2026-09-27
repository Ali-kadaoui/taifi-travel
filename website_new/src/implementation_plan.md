# Implement Single-Application Limit and Modification

## Goal
Restrict users to a single application in their account. If a user already has an application, the application form will load the existing data, allowing the user to review and modify it instead of creating a new one.

## Proposed Changes

### Backend

#### [MODIFY] `taifi-travel-back/Controllers/PendingApplicationsController.cs`
- Update `GetMyApplications` to include the full `PayloadJson` in the response so the frontend can fully reconstruct the form state.

### Frontend

#### [MODIFY] `website_new/src/pages/ApplicationForm.jsx`
- Add a `useEffect` to fetch `authService.getMyApplications()` on component mount if the user is logged in.
- If an existing application is found, populate the `formData` state with its contents and store the application `id`.
- Display a banner at the top of the form indicating that an existing application was found and they are currently updating it.
- Modify `handleSubmit`:
  - If `existingAppId` is present, send a `PUT` request to `/api/pending-applications/{id}` to update the application.
  - If no `existingAppId` is present, send a `POST` request to `/api/public/submit-application` as it currently does.
- Adjust success messages to say "Application Updated Successfully" when modifying an existing application.

## User Review Required

> [!IMPORTANT]
> The backend `UpdateApplication` endpoint currently allows updating *any* pending application by ID, regardless of who owns it. While not requested directly, I plan to leave this as-is since the frontend will only ever query and update the user's *own* application IDs. However, for strict security, we could add an ownership check on the `PUT` endpoint. Do you want me to add an ownership check?

## Verification Plan

### Automated Tests
- None required.

### Manual Verification
- Log in and submit a new application.
- Navigate away and return to the Apply page. Verify the form is pre-filled with the submitted data.
- Modify a field (e.g., last name) and submit. Verify the backend successfully updates the existing application rather than creating a duplicate.
