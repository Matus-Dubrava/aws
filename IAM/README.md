# IAM

IAM (Indetity & Access Management) allows us to manage users, groups, roles and their level of access to the AWS console.

-   **users** - end users
-   **groups** - collection of users under one set of permissions
-   **roles** - we create roles with some set of rules and then we can start adding users or groups to these roles.
-   **policies** - document that defines one or more permissions, written in JSON (JavaScript Object Notation) format, which is a collection of key/value pairs

## available in IAM

-   We can create users and assign either or both console access or programatic access to them. After that, the appropriate credentials are generated for these users (each one separatelly), based on the chosen access method. Either a password and/or access key ID and access secret key. The access key ID and access secret key can't be used to log into the console and are accessible only once, therefore we need store them is some safe place, otherwise we will need to generate a new set of credentials for the given user.

-   We can create a different groups of users with a different access rights and add users to these groups where each user will receive all permissions that are defined for that specific group.

-   We can also assign a permission directly to a user if we want to giv him/her some special rights, outside of the scope of some general group.

*   By default, newly created users have no access right to all AWS services

*   We should always set up a MFA (multifactor authentication) to secure the access to our AWS resources.

*   We should also set up our custom password rotation policies where we can choose the structure of passwords, such as length, required at least on lower/upper case character etc. We can also specify an expiration date for passwords so that they get invalidate after some time e.g. 90 days.

*   We can set up an alarm, informing us that we are reaching a billing limit defined by us.

## Cloud Watch alarm

-   We can set an alarm that will automatically notify all users that we have associated with this alarm (by specifying their email addresses and them confiriming the received confirmation email) that some threshold that we have specified has been reached.
