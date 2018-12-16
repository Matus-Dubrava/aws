-   [AWS Organizations](#aws-organizations)
    -   [Central Management](#central-management)
    -   [Control Access](#control-access)
    -   [Automated AWS Account Creation](#automated-aws-account-creation)
-   [Consolidated Billing](#consolidated-billing)
    -   [Billing alerts](#billing-alerts)
    -   [CloudTrail](#cloudTrail)

# AWS Organizations

AWS Organizations is an account management service that enables you to consolidate multiple AWS accounts into an organization that you create and centrally manage.

AWS Organizations allows you to manage multiple AWS accounts at once. With Organizations, you can create groups of accounts and then apply policies to those groups.

Available in two sets:

-   Consolidate Billing
-   All Features

## Central Management

AWS Organizations allows you to manage multiple AWS accounts at once. You can create groups of accounts, and then attach policies to a group to ensure the correct policies are applied across the accounts. Organizations enables you to centrally manage policies across multiple accounts, withour requiring custom scripts and manual processes.

## Control Access

With AWS Organizations, you can create Service Control Policies (SCPs) that centrally control AWS service use across multiple AWS accounts. You can specifically Allow or Deny individual AWS services. For example, you could deny the use of Kinesis or DynamoDB to your HR group within your AWS Organization. Even if IAM in that account allows it, SCP will override it.

## Automated AWS Account Creation

You can use the AWS Organizations APIs to automate the creation and management of new AWS accounts. The Organizations APIs enable you to create new accounts programatically, and to add the new accounts to a group. The policies attached to the group are automatically applied to the new account.

# Consolidated Billing

AWS organizations enables you to set up a single payment method for all the AWS accounts in your organization through consolidated billing. With consolidated billing, you can see a combined view of charges incurred by all your accounts, as well as take advantage of pricing benefits from aggregated usage, such as volume discounts for Amazon EC2 and Amazon S3.

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
