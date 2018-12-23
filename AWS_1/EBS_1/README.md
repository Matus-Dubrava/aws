-   [EBS](#ebs)
-   [snapshots](#snapshots)

# EBS

-   two types of Block store devices are supported
    -   **elastic block store (EBS)**
        -   persistent
        -   network attached virtual drives
        -   the EBS backed EC2 instance (ie the boot volume of which is EBS) can be stopped, restarted, and terminated
        -   EBS volumes behave like raw, unformatted, external block storage devices that you can attach (mount) to your EC2 instances
        -   EBS volumes are block storage devices suitable for database style data that require frequent reads and writes
        -   EBS volumes are attached to your EC2 instances through the AWS network, like virtual hard drives
        -   an EBS volume can attach to a single EC2 instance only at a time
        -   both EBS volumes and EC2 instance **must be in the same AZ**
            -   you can **NOT** attach a volume in one AZ to an EC2 instance in a different AZ
        -   an EBS volume data is replicated by AWS across multiple sefvers in the same AZ to prevent data loss resulting from any single AWS component failure
        -   by default, EBS volumes created when an EC2 instance is launched are deleted when the instance is terminated, including the root volume
        -   EBS is persistent and can retain the data it has even when the EC2 instance is stopped or restarted
            -   if configured, it can persist after the EC2 instance is terminated
                -   you can change this by changing the _DeleteOnTermination_ attribute of the instance's block store (EBS) volumes
                    -   an EBS volume (root or not) with _DeleteOnTermination_ attribute set to _false_ will not be deleted when the instance is terminated
                    -   this comes in handy when you want to keep the EBS volume for future use while you terminate the EC2 instance
    -   **instance-store**
        -   basically the virtual hard drive on the host allocated to this EC2 instance
        -   limited to 10 GB per device
        -   ephemeral (data is lost on instance shutdown)
            -   the EC2 instance can't be stopped, can only be rebooted or terminated
                -   reboot will not erase the instance data
                -   termination will erase the data
        -   instance store-backed EC2 instances boot from an AMI stored in S3
        -   **use instance store instead of EBS** if very high IOPS rate is required
            -   instance store, although can not provide for data persistence, but it can provide much higher IOPS compared to, network attached, EBS storage
            -   remember that, instance store is the virtual hard disk space allocated to the instance on the local host
                -   it is alos work noting that not all newer EC2 instance support instance store volumes
    -   the difference between an **instance-store backed EC2 instance**, and **EBS-backed EC2 instance that has instance-store volumes** is:
        -   the first one meanst that EC2 instance can **NOT** be stopped, because the root volume is instance-store
        -   the second one **CAN** be stopped, because the main boot volume is EBS, but it has instance-stored volumes for data
            -   when stopped, all instance store volumes' data will be lost

# snapshots

-   EBS snapshots are point-in-time images/copies of your EBS volumes
-   any data written to the volume after the snapshot process is initiated, will **NOT** be included in the resulting snapshot (but will be included in future, incremental, updates)
-   per AWS account, up to 5000 EBS **volumes** can be created
-   per AWS account, up to 10000 EBS **snapshots** can be created
-   EBS snapshots are stored in S3, however you can **NOT** access them directly, you can only access them through EC2 APIs
-   this is unlike instance-store AMIs (where you specify an S3 bucket of your choice)
-   while EBS vlumes are AZ specific
    -   snapshots are **region specific**
    -   to migrate an EBS from one AZ to another, create a snapshot (region specific), and create an EBS volume from the snapshot in the intended (other) AZ
-   you can create/restore a snapshot to an EBS volume of the same or larger size than the original volume size, from which the snapshot was initially created

    -   but you can **NOT** restore an EBS volume's snapshot to a smaller volume size

-   you can take a snapshot of a non-root EBS volume while the volume is in use on a running EC2 instance
    -   this meanst, you can still access it while the snapshot is being processed
    -   however, the snapshot will only include data that is already written to your volume
        -   any data cached by the operating system (OS), or in memory, will not be included, which means the snapshot will not be 100% consistent
-   the snapshot is created immediately, but it may stay in **pending status** until the full snapshot is complete (all changed data blocks are copied to S3), the status then changes to **complete**
    -   this may take few hours to complete, especially for the first time snapshot of a volume
-   during the period when the snapshot **status is pending**, you can still access the volume, but the I/O might be slower because of the snapshot activity
-   while in pending state, an in-progress snapshot will **not** include data from ongoing reads and writes to the volume

    -   this is why for a complete snapshot you need to stop I/Os or unmount the volume if possible (or stop the instance for root volumes)

-   to take a **complete (consistent)** snapshot of your **non-root (not the boot) EBS volume**
    -   pause file writes to the desired volume for enough time to take a snapshot, your snapshot will be complete
    -   if you can't pause file writes, you need to un-mount (detach) the volume from the EC2 instance, take the snapshot, and then re-mount the volume to ensure a consistent complete snapshot
        -   you can re-mount the volume while the snapshot status is pending (being processed)
            -   this means the volume does not have to be detached until the snapshot completes
-   to create a snaphost for **a root (boot) EBS volumes**, you should stop the instance first then take the snapshot
    -   be careful if you have any instance-store volumes on the EC2 instance, their data will be lost once you stop the instance

## Incremental snapshots

-   EBS snapshots are stored incrementally

    -   for low cost storage on S3, and a guarantee to be able to fully restore data from the snapshot
        -   what you need is a single snapshot, then further snapshots sill only carry the changed blocks (incremental updates)
            -   therefore, you do not need to have multiple fill/complete copies of the snapshot (less storage, faster updates)

-   EBS snapshots are **asynchronously** created
    -   this refers to the fact that updates or changes to snapshots do not have to happen immediately when the repspective volume data changes
-   you are charged for
    -   data transferred to S3 from your EBS volume you are taking snapshot of
    -   storage on S3
