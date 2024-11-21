import { javascript } from "projen";
import { CdklabsConstructLibrary } from "cdklabs-projen-project-types";
const project = new CdklabsConstructLibrary({
  author: "AWS",
  authorAddress: "aws-cdk-dev@amazon.com",
  cdkVersion: "2.1.0",
  defaultReleaseBranch: "main",
  devDeps: ["cdklabs-projen-project-types"],
  name: "cdk-multi-az-observability",
  npmAccess: javascript.NpmAccess.PUBLIC,
  projenrcTs: true,
  release: false,
});
project.synth();