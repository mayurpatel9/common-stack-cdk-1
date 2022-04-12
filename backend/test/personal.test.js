"use strict";
/*
import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Personal from '../lib/personal-stack';
import '@aws-cdk/assert/jest';
import { IPublicHostedZone } from '@aws-cdk/aws-route53';
import { ICertificate } from '@aws-cdk/aws-certificatemanager';

test('App Stack', () => {
    const app = new cdk.App();
    // WHEN
  /*
    interface PersonalStackProps extends cdk.StackProps {
    dnsName: string,
    hostedZone: IPublicHostedZone,
    certificate: ICertificate
  }
  const stack = new Personal.PersonalStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {
        "MyS3Bucket4646DF6F": {
          "Type": "AWS::S3::Bucket",
          "Properties": {
            "BucketEncryption": {
              "ServerSideEncryptionConfiguration": [
                {
                  "ServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                  }
                }
              ]
            }
          },
          "UpdateReplacePolicy": "Retain",
          "DeletionPolicy": "Retain",
          
        },
        
      },
      "Outputs": {
        "MyS3BucketNameExport": {
          "Value": {
            "Ref": "MyS3Bucket4646DF6F"
          },
          "Export": {
            "Name": "MyS3BucketName"
          }
        }
      }
    }, MatchStyle.EXACT))
});


test('Stack Create S3 Bucket', () => {
  //ARRANGE
  const app = new cdk.App();
  // ACT
  const stack = new Personal.PersonalStack(app, 'MyTestStack');
    // ASSERT

    expect(stack).toHaveResource('AWS::S3::Bucket');

});

*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc29uYWwudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInBlcnNvbmFsLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWlFRSIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5pbXBvcnQgeyBleHBlY3QgYXMgZXhwZWN0Q0RLLCBtYXRjaFRlbXBsYXRlLCBNYXRjaFN0eWxlIH0gZnJvbSAnQGF3cy1jZGsvYXNzZXJ0JztcbmltcG9ydCAqIGFzIGNkayBmcm9tICdAYXdzLWNkay9jb3JlJztcbmltcG9ydCAqIGFzIFBlcnNvbmFsIGZyb20gJy4uL2xpYi9wZXJzb25hbC1zdGFjayc7XG5pbXBvcnQgJ0Bhd3MtY2RrL2Fzc2VydC9qZXN0JztcbmltcG9ydCB7IElQdWJsaWNIb3N0ZWRab25lIH0gZnJvbSAnQGF3cy1jZGsvYXdzLXJvdXRlNTMnO1xuaW1wb3J0IHsgSUNlcnRpZmljYXRlIH0gZnJvbSAnQGF3cy1jZGsvYXdzLWNlcnRpZmljYXRlbWFuYWdlcic7XG5cbnRlc3QoJ0FwcCBTdGFjaycsICgpID0+IHtcbiAgICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAgIC8vIFdIRU5cbiAgLypcbiAgICBpbnRlcmZhY2UgUGVyc29uYWxTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICAgIGRuc05hbWU6IHN0cmluZyxcbiAgICBob3N0ZWRab25lOiBJUHVibGljSG9zdGVkWm9uZSxcbiAgICBjZXJ0aWZpY2F0ZTogSUNlcnRpZmljYXRlXG4gIH1cbiAgY29uc3Qgc3RhY2sgPSBuZXcgUGVyc29uYWwuUGVyc29uYWxTdGFjayhhcHAsICdNeVRlc3RTdGFjaycpO1xuICAgIC8vIFRIRU5cbiAgICBleHBlY3RDREsoc3RhY2spLnRvKG1hdGNoVGVtcGxhdGUoe1xuICAgICAgXCJSZXNvdXJjZXNcIjoge1xuICAgICAgICBcIk15UzNCdWNrZXQ0NjQ2REY2RlwiOiB7XG4gICAgICAgICAgXCJUeXBlXCI6IFwiQVdTOjpTMzo6QnVja2V0XCIsXG4gICAgICAgICAgXCJQcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgICAgIFwiQnVja2V0RW5jcnlwdGlvblwiOiB7XG4gICAgICAgICAgICAgIFwiU2VydmVyU2lkZUVuY3J5cHRpb25Db25maWd1cmF0aW9uXCI6IFtcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBcIlNlcnZlclNpZGVFbmNyeXB0aW9uQnlEZWZhdWx0XCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJTU0VBbGdvcml0aG1cIjogXCJBRVMyNTZcIlxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJVcGRhdGVSZXBsYWNlUG9saWN5XCI6IFwiUmV0YWluXCIsXG4gICAgICAgICAgXCJEZWxldGlvblBvbGljeVwiOiBcIlJldGFpblwiLFxuICAgICAgICAgIFxuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgIH0sXG4gICAgICBcIk91dHB1dHNcIjoge1xuICAgICAgICBcIk15UzNCdWNrZXROYW1lRXhwb3J0XCI6IHtcbiAgICAgICAgICBcIlZhbHVlXCI6IHtcbiAgICAgICAgICAgIFwiUmVmXCI6IFwiTXlTM0J1Y2tldDQ2NDZERjZGXCJcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiRXhwb3J0XCI6IHtcbiAgICAgICAgICAgIFwiTmFtZVwiOiBcIk15UzNCdWNrZXROYW1lXCJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCBNYXRjaFN0eWxlLkVYQUNUKSlcbn0pO1xuXG5cbnRlc3QoJ1N0YWNrIENyZWF0ZSBTMyBCdWNrZXQnLCAoKSA9PiB7XG4gIC8vQVJSQU5HRVxuICBjb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuICAvLyBBQ1RcbiAgY29uc3Qgc3RhY2sgPSBuZXcgUGVyc29uYWwuUGVyc29uYWxTdGFjayhhcHAsICdNeVRlc3RTdGFjaycpO1xuICAgIC8vIEFTU0VSVFxuXG4gICAgZXhwZWN0KHN0YWNrKS50b0hhdmVSZXNvdXJjZSgnQVdTOjpTMzo6QnVja2V0Jyk7XG5cbn0pO1xuXG4qL1xuIl19