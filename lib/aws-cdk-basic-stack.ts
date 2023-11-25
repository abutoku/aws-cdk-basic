import { Stack, StackProps, Tags, CfnOutput } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class AwsCdkBasicStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // VPC・Public Subnet
    const vpc = new ec2.Vpc(this, 'sample-vpc', {
      cidr: '10.0.0.0/16',
      enableDnsHostnames: true,
      enableDnsSupport: true,
      subnetConfiguration: [
        {
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        }
      ],
    })
    Tags.of(vpc).add('Name', 'sample-vpc')

    // security group
    const securityGroup = new ec2.SecurityGroup(this, 'sg-for-ec2', {
      vpc: vpc,
      description: 'security group for ec2',
      allowAllOutbound: true
    })
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(), 
      ec2.Port.tcpRange(80, 80), 
      'allow http access from anywhere'
    )

    // ubuntu 20.04
    const ubuntuImage = new ec2.GenericLinuxImage({
      'ap-northeast-1': 'ami-088da9557aae42f39',
    })

    // userData
    const userData = ec2.UserData.forLinux()
    userData.addCommands('apt update -y')
    userData.addCommands('apt install -y nginx')

    // ec2instance
    const ec2Instance = new ec2.Instance(this, 'sample-instance', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3, ec2.InstanceSize.MICRO
      ),
      machineImage: ubuntuImage,
      allowAllOutbound: true,
      availabilityZone: vpc.availabilityZones[0],
      instanceName: 'sample-instance',
      userData: userData,
      vpcSubnets: {
        subnets: vpc.publicSubnets
      },
      securityGroup: securityGroup,
    })

    // output
    new CfnOutput(this, 'sample-instance public ip', {
      value: ec2Instance.instancePublicIp,
      description: 'public ip of ec2 instance',
      exportName: 'instancePublicIp',
    });
  }
}