# Security Specification - Clinora

## 1. Data Invariants
- A User must have a `role`, `email`, and `clinicId`.
- Access to clinic-specific resources (patients, appointments, etc.) is restricted to members of that clinic.
- A Clinic owner or admin can manage clinic staff and settings.
- A Super Admin (defined by a list of UIDs or a special flag in the `users` collection) has global access.
- Users can only read and write their own User profile, except for Admins who can manage them.

## 2. The "Dirty Dozen" Payloads (Testing for Failure)

1. **Identity Spoofing**: Attempt to create a user profile for a different UID.
2. **Clinic Hijacking**: Attempt to join a clinic by setting `clinicId` without permission.
3. **Ghost Field**: Attempt to update a clinic with an `isVerified: true` field that doesn't exist in schema.
4. **Invalid Transaction Type**: Attempt to create a transaction with `type: 'money-printer'`.
5. **Unauthorized Patient Access**: User from Clinic A trying to read Patient from Clinic B.
6. **Self-Promotion**: Non-admin user trying to set their own `role` to `admin`.
7. **Negative Amount**: Attempting to set a transaction `amount` to `-5000`.
8. **Invalid ID Format**: Using a 1MB string as a document ID.
9. **PII Leak**: Non-member trying to read a list of patients.
10. **Terminated State Update**: Trying to update an appointment once its status is `completed`.
11. **Orphaned Record**: Creating a patient without a valid clinic reference.
12. **Timestamp Forgery**: Providing a client-side timestamp instead of `serverTimestamp`.

## 3. Test Runner Logic
(To be implemented in `firestore.rules.test.ts`)
