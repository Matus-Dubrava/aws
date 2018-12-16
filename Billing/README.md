-   [AWS Organizations](#aws-organizations)
-   [Consolidated Billing](#consolidated-billing)

# AWS Organizations

AWS Organizations is an account management service that enables you to consolidate multiple AWS accounts into an organization that you create and centrally manage.

Available in two sets:

-   Consolidate Billing
-   All Features

# Consolidated Billing

Paying account is independent. Cannot access resources of the other accounts. All linked accounts are independent. Currently a limit of 20 linked accounts (soft limit) for consolidated billing.

-   one bill per AWS account
-   very easy to track charges and allocate costs
-   volume pricing discounts
-   EC2 reserved instances can be used across linked accounts

Use your paying account only for paying, not for launching EC2 instances etc.

## Billing alerts

-   when monitoring is enabled on the paying account the billing data for all linked accounts is included
-   you can still create billing alerts per individual account

## CloudTrail

-   per AWS account and is enabled per region
-   can consolidate logs under and S3 bucket
    -   1. turn on CloudTrail in the paying account
    -   2. create a bucket policy that allows cross account access
    -   3. turn on CloudTrail in the other accounts and use the bucket in the paying account
