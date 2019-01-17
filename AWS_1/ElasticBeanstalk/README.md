-   [Elastic Beanstalk](#elastic-beanstalk)
    -   [Concepts and Components](#concepts-and-components)
    -   [deployment](#deployment)

# Elastic Beanstalk

-   AWS Elastic Beanstalk is an easy-to-use service for deploying and scaling web applications and services developed with supported programming languages, on familiar servers such as **Apache, Nginx, Passenger, Docker, Tomcat, and IIS**
-   with EB, you can quickly deploy and manage applications in the AWS Cloud withour worrying about the infrastructure that runs those applications
-   EB provides developers and system administrators an easy, fast way to deploy and manage their applications without having to worry about AWS infrastructure
-   AWS EB reduces management complexity without restricting choice of control

-   you simply upload your application, and Elastic Beanstalk automatically handles the details of capacity provisioning, load balancing, scaling, and application health minitoring
-   AWS Elastic Beanstalk provides platforms for
    -   programming languages (Java, .NET, PHP, Node.js, Python, Ruby, Go)
    -   EB spports different platform configuration for each language
    -   web containers (Tomcat, passenger, puma) and docker containers, with multiple configuration of each
    -   EB also supports custom build platforms that you can create and use
-   EB provisions the resources needed to run your application, including one or more Amazon EC2 instances

-   when you deploy your application, EB provisions one or more AWS resources, such as EC2 instances
-   a configuration defines the infrastructure and software stack to be used for a given environment
-   the software stack running on the amazon EC2 instances depends on the configuration

-   to use EB, you need to

    -   create an application
    -   upload an application version in the form of an application source bundle (for example, a Java .war file - web application Archive) to EB, and then
    -   provide some information about the application
    -   EB automatically launches an environment and creates and configures the AWS resources needed to run your code
    -   after your environment is launched, you can then manage your environment and deploy new application versions

-   after you create and deploy your application, information about the application - including metrics, events, and environment status - is available through the AWS management console, APIs, or CLI

-   elastic beanstalk applications run on Amazon EC2 instances that have no persistent local storage
-   when the EC2 instance terminate, the local file system is not saved, and new EC2 instances start with a default file system
-   you should design your application to store data in a persistent data source
-   Amazon Web Services offers a number of persistent storage services that you can leverage for your application, such as S3, EFS, DynamoDB and RDS (not EBS)
-   EB does not restrict your choice of persistent storage and database service options

**rebuilding AWS elastic beanstalk environments**

-   your elastic beanstalk environment can become unusable if you don't use EB functionality to modify or terminate the environment's underlying AWS resource
-   if this happens, you can **rebuild** the environment to attempt to restore it to a working state
    -   rebuilding an environment terminates all of its resources and replaces them with new resources with the same configuration
-   you can also rebuild terminated environments within six weeks (42 days) of their termination, when you rebuild, EB attempts to create a new environment with the same name, ID and configuration

## Concepts and Components

-   **application**
    -   an application serves as a container for the environments that run your web app, and versions of your web app's source code, saved configurations, logs and other artifacts that your create while using EB
    -   an EB application is a logical collection of EB components, including environmets, versions, and environmet configurations
    -   in EB an application is conceptually similar to a folder
    -   deleting an application terminates all associated environmets and deletes all application versions and saved configurations that belong to the application
-   **application version**
    -   in EB, an application version refers to a specific, labeled iteration of deployable code for a web application
    -   an application version points to an Amazon S3 object that contains the deployable code such as a Java WAR file for Java applications and .ZIP file for all other applications
    -   an application version is part of an application
    -   applications can have many versions and each application version is unique
    -   in a running environment, you can deploy any application version you already uploaded to the application or you can upload and immediately deploy a new application version
-   **environment**
    -   is a version that is deployed onto AWS resources
    -   each environment runs only a single application version at a time, however you can run the same version or different versions in many environments at the same time
    -   when you create an environment, EB provisions the resources needed to run the application version you specified
-   **environment tier**
    -   when you launch an EB environment, you first choose an environment tier
    -   the environment tier that you choose determines whether EB provisions resources to support an application that handles HTTP requests or an application that pulls tasks from a queue
    -   an application that serves HTTP requests runs in a web server environment
    -   an environment that pulls tasks from an SQS queue runs in a worker environment
-   **environment configuration**
    -   an environment configuration identifies a collection of parameters and settings that define how an environment and its associated resources behave
    -   when you update an environment's configuration settings, EB automatically applies the changes to existing resources or deletes and deployes new resources (depending on the type of change)
-   **configuration template**
    -   a configuration template is a staring point for creating unique environment configurations
    -   configuration templates can be created or modified by using the EB command line utilities or API

## deployment

-   options

    -   **all at once**
        -   all instances are updated at the same time
    -   **rolling**
        -   updates are performed in batches; old version and new versions running in the environment until all instances are updated
    -   **rolling with additional batch**
        -   maintains full capacity by launching additional instances; when deployment completes, additional instances are terminated
    -   **immutable**
        -   full set of new instances for new version; old instances are terminated after successful deployment

-   **blue/green deployment**
    -   **blue** - production running old version
    -   **green** - new environment running new version
    -   when green deployment is successful, simply swap the CNAMEs of two environments using _Swap environment URLs_ option; green now becomes the new blue production environment
