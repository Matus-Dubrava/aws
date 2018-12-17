-   [VPC](#vpc)
-   [Default VPC](#default-vpc)
-   [VPC Peering](#vpc-peering)
-   [NAT instance](#nat-instance)
-   [NAT gateway](#nat-gateway)
-   [Bastion](#bastion)
-   [Security](#security)
-   [Network ACLs](#network-acls)
-   [Flow Logs](#flow-logs)
-   [Review](#review)

# VPC

-   you can think of VPC as a virtual data centre in the cloud

Amazon Virtual Priva Cloud (VPC) lets you provision a logically isolated section of the Amazon Web Services (AWS) Cloud where you can lauch AWS resources in a virtual network that you define. You have complete control over your virtual networking environment, including selection of your own IP address range, creation of subnets, and configuration of route tables and network gateways.

You can easily customize the nework configuration for your Amazon Virtual Private Cloud. For example, you can create a public-facing subnet for your webservers that has access to the Internet, and place your backed systems as adatabases or application servers in a private-facing subnet with no Internet access. You can leverage multiple layers of security, including security groups and network access control lists, to help control access to Amazon EC2 instances in each subnet.

Additionally, you can create a Harware Virtual Private Network (VPN) connection between your corporate datacenter and your VPC and leverage the AWS cloud as an extension of your corporate datacenter.

we can:

-   launch instances into a subnet of your choosing
-   assing custom IP address ranges in each subnet
-   configure route tables between subnets
-   create internet gateway and attach it to your VPC (there can only be one gateway per VPC, it is usuallu highly available and spans across multiple availability zones, therefore there should not be any need for additional gateway)
-   much better security control over your AWS resources
-   instance security groups
-   subnet network access control lists (ACLS)

# Default VPC

-   default VPC is user friendly, allowing you to immediatelly deploy instances
-   all subnets in default VPC have a route out to the Internet
-   Each EC2 instance has bot a private and public IP address (in case of custom private VPC, EC2 instances have only private IP address)

# VPC Peering

-   allows you to connect one VPC with another via a direct network route using private IP addresses
-   instances behave as if they were on the same private network
-   you can peer VPC's with other AWS accounts as well as with other VPCs in the same account
-   peering is in a star configuration: 1 central VPC peer with 4 others, **NO TRANSITIVE PEERING**

# NAT instance

-   when creating a NAT instance, **disable** source/destination check in the instance
-   NAT instances must be in a public subnet
-   there must be a route out of the private subnet to the NAT instance, in order for this to work
-   the amoun of traffic that NAT instances can support depends on the instance size, if you are bottlenecking, increase the instance size
-   you can create high availability using Autoscaling Groups, multiple subnets in different AZs, and a script to automate failover
-   behind a security group
-   need to disable Source/Destination checks

# NAT gateway

-   preferred by the enterprise
-   scale automatically up to 10Gbps
-   no need to patch
-   not associated with security groups
-   automatically assigned a public ip address
-   remember to update your route tables
-   no need to disable Source/Destination checks

# Bastion

-   NAT is used to prvide internet traffic to EC2 instances in private subnets
-   Bastion is used to securely administer EC2 instances (using SSH or RDP) in private subnets (Bastion is sometimes reffered to as Jump Box)

# Security

-   IAM - controls who can create, manage and use VPCs
-   Firewalls - controls inbound and outbound traffic
    -   security groups
    -   NACLs
-   FlowLogs - capture information about IP traffic going to and from your VPC (troubleshoot issues, monitor traffic)
    -   you can publish flow log data to _S3_ or _CloudWatch_

# Security Groups

Security group is associated with EC2 instance and one instance can have up to 5 security groups associated with it.

More preciselly, security group is associated with the main network interface of EC2 instance. If EC2 instance has more than one network interface, then we can associate different security groups with each interface based on the traffic that flows through that interface.

# Network ACLs

-   your VPC automatically comes with a default network ACL, and by default it allows all outbound and inbound traffic
-   you can create a custom ACLs; by default, each custom network ACL denies all inbound and outbound traffic until you add rules
-   each subnet in your VPC must be associated with a network ACL; if you don't expicitely associate a subnet with a network ACL, the subnet is automatically associated with the default network ACL
-   you can associate a network ACL with multiple subnets, however, a subnet can be associated with only one network ACL at a time; when you associate a netowrk ACL with a subnet, the previous associaton is removed

    -   network ALC can span multiple AZs (as each of our subnet may be located in a different AZ but one subnet can span only through one AZ)

-   network ACLs contain a numbered list of rules that is evaluated in order, startin with the lowest numbered rule
    -   rule that has already been resolved cannot be overwritten
    -   eg. rule: _100 : allow SSH_ | _rule 200: deny SSH_ => rule 100 will win as it was first
-   network ACLs have separate inbound and outbound rules, and each rule can either be ALLOW or DENY
-   network ACLs are stateless, responses to allowed inbound traffic are subject to the rules for outbound traffic (and vice versa)

-   you should allow ACLs rule for ephemeral ports in the outbound rules only

-   **Block IP Addresses using network ACLs not Security Groups**

If we want to use Load Balancer with our custom VPC, we need to take some things into consideration. First, Load Balancer needs at least two public subnets to work, therefore we need to create at least two pulic subnets in our VPC. We can't associate Load Balancer with private subnets (those that do not have Internet Gateway associated with them).

# Flow Logs

VPC Flow Logs is a feature that enables you to capture information about the IP traffic going to and from network interfaces in your VPC. Flow log data is stored using Amazon CloudWatch Logs. After you've created a flow log, you can view and retrieve its data in Amazon CloudWatch Logs.

Flow Logs can be created at 3 levels:

-   VPC
-   Subnet
-   Network Interface Level

-   you cannot enable flow logs for VPCs that are peered with your VPC unless the peered VPC is in your account
-   you cannot tag a flow log
-   after you've created a flow log, you cannot change its configuration; for example, you can't associate a different IAM role with the flow log

Not all traffic is monitored:

-   traffic generated by instances when they contact the Amazon DNS server; if you use your own DNS server, then all traffic to that DNS server is logged
-   traffic generated by a Windows instance for Amazon Windows licence activation
-   Traffic to and from `169.254.169.254` for instance meta-data
-   DHCP traffic
-   traffic to the reserved IP address for the default VPC router

# Review

-   think of VPC as a logical datancenter in AWS
-   consists of IGWs (or Virtual Private Gateways), route tables, Network access control lists, subnets and security groups
-   1 subnet = 1 availability zone (1 subnet **CANNOT** span multiple AZs)
-   security groups are stateful, network access control lists are stateless
-   no transitive peering
    -   subnets A and B are peered, B and C are peered, but if we want to allow peering between A and C then we need to set it up
-   when creating a NAT instance, disable Source/Destination check on the instance
-   **NAT instances** must be in a public subnet
-   by default, you can have 5 VPCs per region
