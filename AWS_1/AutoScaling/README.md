-   [Auto Scaling](#auto-scaling)
    -   [components](#components)
    -   [rebalancing](#rebalancing)
    -   [attaching running instance](#attaching-running-instance)
    -   [instance states](#instance states)
    -   [ELB](#elb)
    -   [health checks](#health checks)
    -   [spot instances](#spot instances)
    -   [SNS](#sns)
    -   [ASG merging](#asg-merging)

# Auto Scaling

-   is an AWS feature that allows your AWS compute needs (EC2 instance fleet) to grow or shrink depending on your workload requirements

-   auto scaling ensures that you have the right number of AWS EC2 instances you your needs at all times

-   auto scaling helps you save cost by cutting down the number of EC2 instances when not needed, and scaling out to add more instances only when it is required

-   AS can be configured from console, CLI, SDKs, and APIs
-   auto scaling can span Multi-AZs within the same region, hence, it can be used to create fault tolerant designs on AWS
-   cost:
    -   there is no additional cost for launching AS groups, you pay for what you use of EC2 instances
    -   AS can grow or shring your EC2 instances base, according to your needs, hence, can play an important role in cost management
-   it works well with AWS ELB, Cloud Watch, and Cloud Trail
-   AS is compliant with PCI DSS

-   auto scaling can NOT span across multiple regions
-   you can determine which subnets will AS groups use to launch new instances in each AZ
-   auto scaling service aways tries to distribute EC2 instances evenly across AZs where it is enabled
-   if auto scaling fails to launch instances in an AZ (for AZ failure or capacity unavailability) it will try in the other AZs defined for this AS group until it succeeds

-   when you delete an ASG, its parameters minimum, maximum, and desired capacity are all set to zero (it shows under AWS console view as well), hence, it terminates all its EC2 instances

-   if you want to keep the EC2 instances and manage them independently, you can manually detach them first, then delete the ASG

## components

-   **launch configuration**
    -   is the configuration template used to create new EC2 instances for the ASG, defines parameters like
        -   instance family, instance type, AMI, key pair, block device, and sec. group are parameters defined in the launch configuration
    -   can be created from AWS console or CLI
    -   you can create a launch configuration from scratch **or**
    -   you can use an existing/running EC2 instance to create the launch configuration
        -   this is provided that the AMI used to launch this instance does still exist on AWS
        -   EC2 instance tags, and any additional block store volumes created after the instance launch will not be taken into account
    -   if you want to change your launch configurations, you have to create a new one make the required changes, and use that with your auto scaling groups
-   **AS group**
    -   is a logical grouping of EC2 instance
    -   is a collection of EC2 instances managed by an auto scaling policy
    -   an ASG can have a minimum, maximum, and desired capacity of EC2 instances
    -   **can be edited after it is created**
-   **scaling policy**
    -   determines when/if and how the ASG scales or shrinks (on-demand, dynamic scaling, cyclic/scheduled scaling)

## rebalancing

-   if AS finds that the number of EC2 instances launched by an ASG into subject AZs is not balanced (EC2 instances are not evenly distributed across AZs), AS will initiate a re-balancing activity

    -   the target of the activity would be to reach an even distribution of instances between AZs
    -   AS does that by launching new EC2 instances in the AZs that have less EC2 instances **first**, then terminating EC2 instances from the AZs that had more EC2 instances
        -   this would help avoid impact on current performance while AZ rebalance is going on

-   what can cause in imbalance of EC2 instances

    -   you manually change the AZs where your AS is in effect (adding or removing AZs)
    -   manually requesting termination of EC2 instances from your ASG
    -   an AZ that did not have enough EC2 capacity, now has enough capacity and it is one of your ASG AZs
    -   an AZ with spot instances market price meeting your bid price

-   **what will happen if the AS group was at or near the maximum capacity when AZ rebalancing kicks in**
    -   AS group is allowed to grow 10% (or 1 EC2 instance, whichever is greater) above the its maximum temporarily, until rebalancing is done

## attaching running instance

-   using AWS console or CLI, you can attach a running EC2 instance to an AS group, if the below conditions are met
    -   instance is in running state (not stopped or terminated)
    -   AMI used to launch the instance still exsits
    -   instance is not part of another AS group
    -   instance is in the same AZs of the AS group
-   if the existing EC2 instances under the AS group, plus the one to be added, exceed the maximum capacity of the ASG, the request will fail, EC2 instance won't be added

## instance states

-   when ASG scales out, the newly added instance enters pending state
-   once the instance is ready and it has passed health checks, it enters _inService_ state
-   if, on the other hand, health checks have failed or ASG is scaling in, EC2 instance enters _terminating_ state
-   lastly, it enters _terminated_ state

-   **once in "terminating" state**, the EC2 instance can **NOT** be put back into service again by AWS console or CLI

-   you can manually remove (detach) EC2 instances from an AS group using AWS console or CLI
-   you can then manage the detached instances independently, or attach it to another ASG
-   when you detach an instance, you have the option to decrement the ASG's desired capacity
    -   if you do not, the ASG will launch another instance to replace the one that you have detached

### standby state

-   you can manually move an instance from an ASG and put it in standby state
    -   instances in standby are still managed by auto scaling
    -   instances in standby state are charged as normal, inservice, instances
    -   they do not count towards available EC2 instance for workload/application use
    -   auto scaling does not perform health checks on instances in standby state
        -   you can troubleshoot the instance or mage changes (update image...) in standby mode, without having the auto scaling consider that as the instance being unhealthy

## ELB

-   you can attach one or more (classic) ELBs to your existing AS group
    -   the ELB(s) must be in the same region as the ASG
-   once you do this, any EC2 instanceexisting or added by the ASG will be automatically registered with the ASG defined ELB
    -   you do not need to register those instances manually on the ASG defined ELB
    -   the ELB(s) will then become the focal point for any inbound traffic destined to the ASG EC2 instances
-   instance in the ELB(s) must be in the same VPC

-   if an ELB is attached to the AS group, then the ELB instance must be in the same VPC, and are in the same region as the ASG
-   auto scaling adds the attached EC2 instances to the ELB(s) defined to the ASG

    -   once the EC2 instance is added to the ASG, it will be automatically registered with the ELB(s) defined under the ASG

-   if the ASG had and ELB defined, detaching will also deregister it from the ELB

    -   if connection draining was enabled inder the ELB, auto scaling will honor it

-   if ASG is not configured to use ELB health checks and the ELB will deem EC2 instance unhealthy, what happens is that the ELB will stop sending request to that instance, but ASG will not terminate it and launch a new one
    -   which implies that you should always use ELB health checks when using ASG with ELB
    -   when using ELB health checks, it is actually a combination of both the ELB health checks and the EC2 service health checks; if any of these deems the instance unhealthy, it is enough for ASG to terminate the instance and launch a new one
    -   similarly if there are multiple ELB(s) attached to the ASG, just one, reporting the instance to be unhealthy is enough for ASG to replace it

## health checks

-   auto scaling classifies its EC2 instances health status as either healthy or unhealthy
-   by default, AS uses EC2 health checks only to determine the health status of the instance
-   when you have one or more ELBs defined with the ASG, you can configure AS to **use both the** EC2 health checks and the ELB health checks to determine the instance health status
-   health check grace period

    -   by default is 300 seconds
        -   is the time AS waits from the time an instance comes into service (becomes inservice) before checking its health status
    -   a value of _zero_ means no grace period and the instance health is checked once it is inService

-   until the grace period timer exipres, any unhealthy status reported by EC2 status checks, or the ELB attached to the ASG, will not be acted upon
-   after grace period expires, AS would consider in instance unhealthy in any of the following cases:

    -   EC2 status checks report to AS an instance status other than running
        -   if the instance status is imaired due to a host hardware or software problem
    -   if ELB health ckecks are configured to be used by the AS, then if the ELB reports the instance as _Out-of-Service_
        -   if you have multiple ELBs attached to the ASG, if any of them reports the EC2 instance status as _Out-of-Service_

-   **one source reporting the instance as unhealthy is enough for AS to mark it for replacement**

-   once AS identifies an instance as unhealthy, it gets scheduled for termination

    -   the instance will never recover its health again automatically

-   during a very short time period, **you can use the AWS command (as-set-instance-health) to set the instance health back to healthy**

    -   if the AS started terminating the instance, you will get an error if you try to apply this command

-   **unlike AZ rebalancing**, termination of unhealthy instances happens first, then AS attempts to launch new instance to replace the one that has been terminated

-   Elastic IP and EBS volumes gets detached from the terminated instances, you need to manually attach them to the new instance

## spot instances

-   you can choose to use Spot instances in your launch configuration, and specify your bid price
-   auto scaling treats the spot instance the same way it treats on-demand instance
-   you can **NOT** mix and match on-demand with spot instances in your AS launch configuration
-   if you want to change the bid price, you have to create a new launch configuration
-   if the AS tries to launch spot instances in an AZ unsuccessfully because of the market price, it will try in another AZ if its market price drops below bid price
    -   of the original AZ's spot market price drops below the bid price, then the AS process will try to rebalance between the two AZs

## SNS

-   you can configure AS to send an SNS email notification whenever
    -   instance is launched
    -   instance is terminated
    -   instance fails to launch
    -   instance fails to terminate

## ASG merging

-   can only be done from the CLI (not AWS console)
-   you can merge multiple, single AZ, auto scaling groups into a single, one Multi-AZ, auto scaling group
-   to do this
    -   re-zone one of the groups to cover/span the other AZs for the other ASGs
    -   delete the other ASGs
-   this can be used in merging ASGs with/without ELB attached to them
-   the resulting ASG must be one of the pre-existing ASGs, not a new one
