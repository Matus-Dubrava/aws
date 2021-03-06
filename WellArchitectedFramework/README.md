-   [Security](#security)
    -   [Data Protection](#data-protection)
    -   [Privilege Management](#privilege-management)
    -   [Infrastructure Protection](#infrastructure-protection)
    -   [Detective Controls](#detective-controls)
-   [Reliability Pillar](#reliability-pillar)
    -   [Foundations](#foundations)
    -   [Change Management](#change-management)
    -   [Failure Management](#failure-management)
-   [Cost Optimization](#cost-optimization)
    -   [Matched supply and demand](#matched-supply-and-demand)
    -   [Cost Effective Resources](#cost-effective-resources)
    -   [Expenditure Awareness](#expenditure-awareness)
    -   [Optimizing Over Time](#optimizing-over-time)

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

# Performance Efficiency Pillar

The Performance Efficiency pillar focuses on how to use computing resources efficiently to meet your requirements and how to maintain that efficiency as demand changes and technology evolves.

-   democratize advanced technologies (treat these technologies as services that can be used by anyone, you don't need NoSQL DBA expert to use DynamoDB)
-   go global in minutes
-   use server-less architecture (Lambda + S3 vs. EC2 instance)
-   experiment more often

Performance Efficiency in the cloud consists of 4 areas:

-   compute
-   storage
-   database
-   space-time trade-off

## Compute

When architecting your system it is important to choose the right kind of server. Some applications require heavy CPU utilization, some require heavy memory utilization etc.
With AWS servers are virtualized and at the click of a button (or API call) you can change the type of server in which your environment is running on. You can even swith to running no servers at all and use AWS Lambda.

### Compute Questions

-   How do you select the appropriate instance type for your system?
-   How do you ensure that you continue to have the most appropriate instance type as new instance types and features are introduced?
-   How do you monitor your instances post launch to ensure they are performing as expected?
-   How do you ensure that the quantity of your instance matches demand?

## Storage

The optimal storage solutions for your environment depends on a number of factors:

-   access method - block, file or object
-   patterns of access - random or sequential
-   throughput required
-   frequency of access - online, offline, archival
-   frequency of update - work (stale), dynamic
-   availability constraints
-   durability constraints

At AWS the storage is virtualized. With S3 you cna have 11 x 9's durability, Cross Region Replication etc. With EBS you can choose between different storage mediums (such as SSD, Magnetic, PIOPS etc.). You can also easily move volumes between the different types of storage mediums (via snapshots)

### Storage Questions

-   How do you select the appropriate storage solution for your system?
-   How do you ensure that you continue to have the most appropriate storage soluteion as new storage solutions and features are launched?
-   How do you monitor your storage solution to ensure it is performing as expected?
-   How do you ensure that the capacity and throughput of your storage solution matches demand?

## Database

The optimal database solution depends on a number of factors. Do you need database consistency, do you need high availability, do you need NoSQL, do you need DR etc?
With AWS you get a lot of options. RDS, DynamoDB, Redshift etc.

### Database Questions

-   How do you select the appropriate database solution for your system?
-   How do you ensure that you continue to have the most appropriate database solution and features as new solutions and features are launched?
-   How do you monitor your databases to ensure performance is as expected?
-   How do you ensure the capacity and throughput of your database matches demand?

## Space-Time trade-off

Using AWS you can use services such as EDS to add read replicas, reducing the load on your database and creating multiple copies of the database. This helps to lower latency.

You can use Direct Connect to provide predictable latency between your HQ and AWS.

You can use the global infrastructure to have multiple copies of your environment, in regions that are closest to your custormer base. You can also use caching services such as ElastiCache or CloudFront to reduce latency.

### Space-Time trade-off Questions

-   How do you select the appropriate proximity and chaching solutions for your systems?
-   How do you ensure that you continue to have the most appropriate proximity and caching solutions as new solutions are launched?
-   How do you monitor your proximity and caching solutions to ensure performance is as exprected?
-   How do you ensure that the proximity and caching solutions you have matches demand?

# Cost Optimization

Use the cost optimization pillar to reduce your costs to a minimum and use those savings for other parts of your business. A cost-optimized system allows you to pay the lowest price possible while still achieving your business objectives.

-   transparently attribute expenditure
-   use managed services to reduce cost of ownership
-   trade capital expense for operating expense
-   benefit from economies of scale
-   stop spending money on data center operations

Cost optimization in the cloud consists of 4 areas:

-   matched supply and demand
-   cost-effective resources
-   expenditure awareness
-   optimizing over time

## Matched supply and demand

Try to optimally align supply with demand. Don't over provision or under provision, instead as demand grows, so should your supply of compute resources. Think of things like _autoscaling_ which scale with demand. Similarly in a server-less context, use services such as Lambda that only execute (or respond) when a request (demand) comes in.

Services such as CloudWatch can also help you to keep track as to what your demand is.

### Matched supply and demand Questions

-   How do you make sure your capacity matches but does not sustantially excess what you need?
-   How are you optimizing your usage of AWS services?

## Cost Effective Resources

Using the correct instance type can be key to cost savings. For example, you might have a reporting process that is running on a _t2.Micro_ and it takes 7 hours to complete. That same process could be run on an _m4.2xlarge_ in a manner of minutes. The result remains the same but the _t2.Micro_ is more expensive because it ran for longer.

A well architected system will use the most cost efficient resources to reach the end business goal.

### Cost Effective Resources

-   Have you selected the appropriate resource types to meet your cost targets?
-   Have you selected the appropriate pricing model to meed your cost targets?
-   Are there managed services (higher-level services than Amazon EC2, Amazon EBS, and Amazon S3) that you can use to improve your ROI?

## Expenditure Awareness

With cloud you no longer have to go out and get quotes on physical servers, choose a supplier, have those resources delivered, installed, made available etc. You can provision things within seconds, however this comes with its own issues. Many organisations have different teams, each with their own AWS accounts. Being aware of what each team is spending and where is crutial to any well architected system. You can use cost allocation tags to track this, billing alerts as well as consilidated billing.

### Expenditure Awareness Questions

-   What access controls and procedures do you have in place to govern AWS costs?
-   How are you monitoring usage and spending?
-   How do you decommission resources that you no longer need, or stop resources that are temporarily not needed?
-   How do you consider data-transfer charges when designing your architecture?

## Optimizing Over Time

AWS moves FAST. There are hundreds of new services. A service that you chose yesterday may not be the best service to be using today. For example consider MySQL RDS, Aurora was launched at re:invent 2014 and is out of preview. Aurora may be a better option now for your business because of its performance and redundancy. You should keep track of the changes made to AWS and constantly re-evaluate your existing architecture. You can do this by subscribing to the AWS blog and by using services such as Trusted Advisor.

### Optimizing Over Time Questions

-   How do you manage and/or consider the adoption of new services?

# Operational Excellence

The Operational Excellence pillar includes operational practices and procedures used to manage production workloads.

This includes how planned changes are executed, as well as repsponses to unexpected operational events.

Change execution and reponses should be automated. All processes and procedures of operational excellence should be documented, tested, and regularly reviewed.

-   perform operations with code
-   align operation processes to busness objectives
-   make regular, small, incremental changes
-   test for responses to unexpected events
-   learn from operational events and failures
-   keep operations procedures current

There are three best practice areas for operational Excellence in the cloud:

-   preparation
-   operation
-   response

## Preparation

Effective preparation is required to drive operational excellence. Operations checklists will ensure that workloads are ready for production operation, and prevent unintentional production promotion without effective preparation.

Workloads should have:

-   **runbooks** - operations guidance that operations teams can refer to so they can perform normal daily tasks
-   **playbooks** - guidance for responding to unexpected operational events. Playbooks should include response plans, as well as escalation paths and stakeholder notifications.

In AWS there are several methods, services, and features that can be used to support operational readiness, and the ability to prepare for normal day-to-day operations as well as unexpected operational events.

_CloudFormation_ can be used to ensure that environments contain all required resources when deployed in production, and that the configuration of the environment is based on tested best practices, which reduces the opportunity for human error.

Implementing _auto scaling_, or other automated scaling mechanisms, will allow workloads to automatically respond when business-related events affect operational needs.

Services like _AWS Config_ with the AWS Config rules feature create mechanisms to automatically track and respond to changes in your AWS workloads and environments.

It is also important to use features like _tagging_ to make sure all resources in a workload can be easily identified when needed during operations and responses.

## Operations

Operations should be standardized and manageable on a routine basis. The focus should be on automation, small frequent changes, regular quality assurance testing, and defined mechanisms to track, audit, roll back, and review changes. Changes should not be large and infrequent, they should not require scheduled downtime, and they should not require manual execution. A wide range of logs and metrics that are based on key operational indicators for a workload should be collected and reviewed to ensure continuous operations.

In AWS you can set up a continuous integration / continuous deployment (CI/CD) pipeline (e.g. source code repository, build systems, deployments and testing automation). Rlease management processes, whether manual or automated, should tested and be based on small incremental changes, and tracked versions. You should be able to revert changes that introduce operational issues without causing operational impact.

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
