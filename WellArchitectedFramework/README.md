-   [Security](#security)
    -   [Data Protection](#data-protection)
    -   [Privilege Management](#privilege-management)
    -   [Infrastructure Protection](#infrastructure-protection)
    -   [Detective Controls](#detective-controls)
-   [Reliability Pillar](#reliability-pillar)
    -   [Foundations](#foundations)
    -   [Change Management](#change-management)
    -   [Failure Management](#failure-management)

# Security

-   apply security at all levels (nets, subnets, EC2 instances)
-   enable tracability
-   automate responses to security events
-   focus on securing your system
-   automate security best practices

Security in the cloud consists of 4 areas:

-   data protection
-   privilege management
-   infrastructure protection
-   detective controls

## Data Protection

Before you begin to architect security practices across your environment, basic data classification should be in place. You should organise and classify your data in to segments such as _publicly available_, _available to only members of your organisation_, _available to only certain members of your organisation_, _available only to the board_ etc. You should also implement a least privilege access system so that people are only able to access what they need. However most importantly, you should encrypt everyting where possible, whether it be at rest or in transit.

In AWS the following practices help to protect your data

-   AWS customers maintain full control over their data
-   AWS makes it easy for you to encrypt your data and manage keys, including regular key rotation, which can be easily automated natively by AWS or maintained by a customer
-   detailed logging is available that contains important content, such as file access and changes (**CloudTrail**)
-   AWS has designed storage systems for exceptional resiliency. As an example, **S3** is designed for 11 nines of durability. (For Example, if you store 10,000 objects with S3, you can on average expect to incur a loss of a single object once every 10,000,000 years)
-   Versioning, which can be part of a larger data lifecycle-management process, can protect against accidental overwrites, deletes, and similar harm
-   AWS never initiates the movement of data between regions. Content placed in a region will remain in that region unless the customer expicitly enable a feature or leverages a service that provides that functionality (e.g. _S3 cross-region replication_)

### Data Protection Questions

-   How are you encrypting and protecting your data at rest?
-   How are you encrypting and protecting your data in transit? (SSL)

## Privilege Management

Privilege management ensures that only authorized and authenticated users are able to access your resources, and only in a manner that is intended. It can include:

-   Access Control Lists (ACLs)
-   Role Based Access Controls
-   Password Management (such as password rotation policy)

### Privilege Management Questions

-   How are you protecting access to and use of the AWS root account credentials?
-   How are you defining roles and responsibilities of system users to control human access to the AWS Management Console and APIs?
-   How are you limiting automated access (such as from applications, scripts, or third-party tools or services) to AWS resources?
-   How are you managing keys and credentials?

## Infrastructure Protection

Outside of Cloud, this is how you protect your data centre. RFID controls, security, lockable cabinets, CCTV etc. Within AWS they handle this, so really infrastructure protection exists at a VPC level (public vs private subnets, routing etc.).

### Infrastructure Protection Questions

-   How are you enforcing network and host-level boundary protection?
-   How are you enforcing AWS service level protection?
-   How are you protecting the integrity of the operating systems on your Amazon EC2 instances? (firewall for Windows...)

## Detective Controls

You can use detective controls to detect or identify a security breach. Aws services to achieve this include:

-   AWS CloudTrail
-   AWS CloudWatch
-   AWS Config
-   S3
-   Glacier

### Detective Controls Questions

-   How are you capturing and analyzing AWS logs?

# Reliability Pillar

-   test recovery procedures (e.g. test recovery procedures - Netflix Simian Army: Chaos Monkey, Chaos Snail)
-   automatically recover from failure
-   scale horizontally to increase aggregate system availability
-   stop guessing capacity (underprovisioning, overprovisioning)

Reliability in the cloud consists of 3 areas:

-   foundations
-   change management
-   failure management

## Foundations

Before building a house, you always make sure that the foundations are in place before you lay the first block. Similarly before architecting any system, you need to make sure you have the prerequisite foundations. In traditional IT one of the first things that you should consider is the size of the comms link between your HQ and your datacenter. If you misprovision the link, it can take 3 - 6 months to upgrade which can cause a huge disruption to your traditional IT estate.

With AWS, they handle most of the foundations for you. The cloud is designed to be essentially limiteless meaning that AWS handle the networking and compute requirements themselves. However they do set service limits to stop customers from accidentally over-provisioning resources.

Key AWS services: IAM, VPC

### Foundations Questions

-   How are you managing AWS service limits for your account?
-   How are you planning your network topology on AWS?
-   Do you have an escalation path to deal with technical issues?

## Change Management

You need to be aware of how change affects a system so that you can plan proactively around it. Monitoring allows you to detect any changes to your environment and react. In traditional systems, change control is done manually and are carefully co-ordinated with auditing.

With AWS things are a lot easier, you can use CloudWatch to monitor your environment and services such as autoscaling to automate change in response to changes on your production environment.

Key AWS services: AWS CloudTrail

### Change Management Questions

-   How does your system adapt to changes in demand?
-   How are you monitoring AWS resources?
-   How are you executing change management?

## Failure Management

With cloud, you should always architect you systems with the assumptions that failure will occur. You should become aware of these failures, how they occured, how to respond to them and then plan on how to prevent these from happening again.

Key AWS services: AWS CloudFormation, RDS multi-AZ

### Failure Management Questions

-   How are you backing up your data?
-   How does your system withstand component failures?
-   How are you planning for recovery?

# Shared Responsibility model

Customer (us) is responsible for:

-   Platform, Applications, IAM
-   operating systems, network and firewall configuration
-   client side data encryption and access, integrity and authentication
-   server side encryption, file system and/or data
-   network traffic protection (encryption, integrity, identity)

AWS is responsible for:

-   compute, storage, database (e.g. AWS is responsible for patching MySQL server), physical networking
-   physical hardware
-   regions, AZs, edge locations
