import { Certificate, CertificateValidation, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { IPublicHostedZone, PublicHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface PersonalDnsStackProps extends StackProps {
    dnsName: string
}

export class PersonalStackDns extends Stack {

    public readonly hostedZone: IPublicHostedZone;
    public readonly certificate: ICertificate;

    constructor(scope: Construct, id: string, props: PersonalDnsStackProps) {
        super(scope, id, props);

        //Public Hosted Zone
        this.hostedZone = new PublicHostedZone(this, 'PersonalAppHostedZone', {
             zoneName:props.dnsName,
        });
        this.hostedZone.applyRemovalPolicy(RemovalPolicy.DESTROY);

        //Certificate Manager
        this.certificate = new Certificate(this, 'PersonalAppCertificateManager', {
            domainName: props.dnsName,
            validation:CertificateValidation.fromDns(this.hostedZone),
        })

        this.certificate.applyRemovalPolicy(RemovalPolicy.DESTROY)
    }
}
