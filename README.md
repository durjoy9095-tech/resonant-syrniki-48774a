# Lifetime Health Record — Fresh V5

## Account rules
- This version starts with a fresh local account storage and a fresh backend namespace, so accounts from the previous version are not carried over.
- The first account that successfully logs in becomes the only Super Admin.
- Later accounts are normal users unless the Super Admin promotes them to Admin.
- Super Admin and Admin can send notices.
- A patient can permanently delete their own account from Profile → Delete My Account.
- If the Super Admin deletes their own account, the next account that successfully logs in can become the new Super Admin.

## Important
- The app still uses browser localStorage for passwords and health records. It is a demo/prototype and is not suitable for real medical data without a proper secure authentication/database system.
- Recovery OTP shown by the current frontend is a demo OTP; real SMS/email OTP needs a backend provider.
- Deploy the entire `LifetimeHealthRecord_Website` folder to Netlify so the Netlify Functions are deployed too.


## Completely fresh deployment v6
This build uses a new backend Blob store and a new browser storage namespace. On first load it removes previous LHR localStorage keys, so old browser accounts are not reused. The first account created in this fresh deployment is the sole Super Admin; later accounts are normal users.


FINAL FIX NOTES:
- Fixed Patient Health Center buttons so they are rebuilt every time Patient is opened.
- Fixed duplicated/missing Patient button rendering logic.
- Fixed section navigation button labels to '← Health Center'.
- Global Super Admin rule: the first account created in the Netlify backend becomes the only Super Admin. No fixed account ID is used.
