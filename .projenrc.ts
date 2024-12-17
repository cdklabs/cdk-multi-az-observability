// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { CdklabsConstructLibrary } from 'cdklabs-projen-project-types';
import { JsonPatch, javascript } from 'projen';
import { UpgradeDependenciesSchedule } from 'projen/lib/javascript';

const project = new CdklabsConstructLibrary ({
  author: 'AWS',
  authorAddress: 'aws-cdk-dev@amazon.com',
  homepage: 'https://github.com/cdklabs/cdk-multi-az-observability',
  repositoryUrl: 'https://github.com/cdklabs/cdk-multi-az-observability/',
  cdkVersion: '2.173.1',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.5.0',
  name: '@cdklabs/multi-az-observability',
  devDeps: [
    'cdklabs-projen-project-types',
    'aws-cdk-lib',
    'cdk-nag'
  ],
  private: false,
  npmAccess: javascript.NpmAccess.PUBLIC,
  license: 'Apache-2.0',
  githubOptions: {
    mergify: true,
    mergeQueue: true
  },
  autoMerge: true,
  autoMergeOptions: {
    approvedReviews: 0
  },
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['cdklabs-automation', "hakenmt", "github-bot"]
  },
  eslint: false,
  eslintOptions: {
    dirs: [
      '**/*.ts',
      '**/*.tsx',
    ],
    fileExtensions: [],
  },
  prettier: true,
  prerelease: 'alpha',
  projenrcTs: true,
  description:
    'A CDK construct for implementing multi-AZ observability to detect single AZ impairments',
  dependabot: false,
  buildWorkflow: true,
  depsUpgrade: true,
  release: true,
  npmProvenance: false,
  releaseToNpm: true,
  majorVersion: 0,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve', 'auto-merge'],
      schedule: UpgradeDependenciesSchedule.WEEKLY,
    },
  },
  workflowNodeVersion: '20',
  workflowRunsOn: [
    'codebuild-Arm64CdkLabsGithubRunner-${{ github.run_id }}-${{ github.run_attempt }}',
  ],
  keywords: [
    'cdk',
    'aws-cdk',
    'cloudwatch',
    'observability',
    'monitoring',
    'resilience',
    'multi-az',
  ],
  gitignore: [
    '*.d.ts',
    '*.js',
    'node_modules/',
    'lib/',
    'coverage/',
    'test-reports/',
    '.cdk.staging',
    'cdk.out',
    '/cdk/bin/',
    '/cdk/obj/',
    '.DS_Store',
    '**/.DS_Store',
    'src/canaries/src/package',
    'src/canaries/src/canary.zip',
    'src/outlier-detection/src/scipy',
    'src/outlier-detection/src/outlier-detection.zip',
    'src/outlier-detection/src/scipy-layer.zip',
    'src/monitoring',
    'tsconfig.tsbuildinfo',
    'package-lock.json',
    '.jsii',
    'tsconfig.json',
  ],
  publishToNuget: {
    dotNetNamespace: 'Cdklabs.MultiAZObservability',
    packageId: 'Cdklabs.MultiAZObservability',
  },
  publishToGo: {
    // The repo where the module will be published
    moduleName: 'github.com/cdklabs/cdk-multi-az-observability-go',
    // The name of the package which will become the directory in
    // the repo where the go module files are placed
    packageName: 'multi-az-observability',
  },
  publishToPypi: {
    distName: 'cdklabs.multi-az-observability',
    module: 'cdklabs.multi_az_observability',
  },
  publishToMaven: {
    mavenGroupId: 'io.github.cdklabs',
    javaPackage: 'io.github.cdklabs.multiazobservability',
    mavenArtifactId: 'cdk-multi-az-observability',
  },
  jest: true,
  jestOptions: {
    jestConfig: {
      roots: ['<rootDir>/test'],
      testMatch: ['**/*.test.ts'],
    },
  },
});

project.tasks.addTask('build-monitoring-layer', {
  steps: [
    {
      exec: 'rm -rf src/monitoring/src/monitoring',
    },
    {
      exec: 'rm -f src/monitoring/src/monitoring-layer.zip',
    },
    {
      exec: 'mkdir -p src/monitoring/src/monitoring',
    },
    {
      exec: 'mkdir -p lib/monitoring/src',
    },
    {
      exec: 'pip3 install aws-embedded-metrics aws-xray-sdk --only-binary=:all: --target src/monitoring/src/monitoring/python/lib/python3.12/site-packages --platform manylinux2014_aarch64',
    },
    {
      exec: 'cd src/monitoring/src/monitoring && zip -r ../monitoring-layer.zip .',
    },
    {
      exec: 'cp src/monitoring/src/monitoring-layer.zip lib/monitoring/src/monitoring-layer.zip',
    },
  ],
});

project.tasks.addTask('build-canary-function', {
  steps: [
    {
      exec: 'rm -rf src/canaries/src/package',
    },
    {
      exec: 'rm -rf lib/canaries/src',
    },
    {
      exec: 'rm -f src/canaries/src/canaries.zip',
    },
    {
      exec: 'mkdir -p src/canaries/src/package',
    },
    {
      exec: 'mkdir -p lib/canaries/src',
    },
    {
      exec: 'docker run --rm --platform "linux/arm64" --user "0:0" --volume "$PWD/src/canaries/src:/asset-input:delegated" --volume "$PWD/src/canaries/src/package:/asset-output:delegated" --workdir "/asset-input" "public.ecr.aws/sam/build-python3.12" bash -c "pip install --no-cache --requirement requirements.txt --target /asset-output && cp --archive --update index.py /asset-output"',
    },
    {
      exec: 'cd src/canaries/src/package && zip -r ../canary.zip .',
    },
    {
      exec: 'cp src/canaries/src/canary.zip lib/canaries/src/canary.zip',
    },
  ],
});

project.tasks.addTask('build-scipy-layer', {
  steps: [
    {
      exec: 'rm -rf src/outlier-detection/src/scipy',
    },
    {
      exec: 'rm -f src/outlier-detection/src/scipy-layer.zip',
    },
    {
      exec: 'mkdir src/outlier-detection/src/scipy',
    },
    {
      exec: 'mkdir -p lib/outlier-detection/src',
    },
    {
      exec: 'pip3 install scipy --only-binary=:all: --target src/outlier-detection/src/scipy/python/lib/python3.12/site-packages --platform manylinux2014_aarch64',
    },
    {
      exec: 'cd src/outlier-detection/src/scipy && zip -r ../scipy-layer.zip .',
    },
    {
      exec: 'cp src/outlier-detection/src/scipy-layer.zip lib/outlier-detection/src/scipy-layer.zip',
    },
  ],
});

project.tasks.addTask('build-outlier-detection-function', {
  steps: [
    {
      exec: 'mkdir -p lib/outlier-detection/src',
    },
    {
      exec: 'rm -f src/outlier-detection/src/outlier-detection.zip',
    },
    {
      exec: 'zip src/outlier-detection/src/outlier-detection.zip src/outlier-detection/src/index.py',
    },
    {
      exec: 'cp src/outlier-detection/src/outlier-detection.zip lib/outlier-detection/src/outlier-detection.zip',
    },
  ],
});

const buildAssets = project.tasks.addTask('build-assets', {
  steps: [
    {
      exec: 'export DOCKER_DEFAULT_PLATFORM="linux/arm64"',
    },
    {
      spawn: 'build-canary-function',
    },
    {
      spawn: 'build-outlier-detection-function',
    },
    {
      spawn: 'build-scipy-layer',
    },
    {
      spawn: 'build-monitoring-layer',
    },
    {
      exec: 'rm -rf lib/azmapper/src',
    },
    {
      exec: 'cp -R src/azmapper/src lib/azmapper',
    },
  ],
});

project.tasks.tryFind('compile')?.spawn(buildAssets);
project.tasks.tryFind('post-compile')?.exec('npx awslint');

// tsconfig.json gets the exclude list updated and isn't tracked
project.tasks.tryFind('release')?.updateStep(4, {
  exec: "git diff --ignore-space-at-eol --exit-code ':!tsconfig.json'",
});

project.github
  ?.tryFindWorkflow('release')
  ?.file?.patch(JsonPatch.remove('/jobs/release_pypi/steps/1'));

project.github
  ?.tryFindWorkflow('release')
  ?.file?.patch(JsonPatch.add('/jobs/release_maven/steps/2', {"name": " Install gpg-agent", "run": "dnf install --assumeyes --allowerasing gnupg2"}));

project.github
  ?.tryFindWorkflow('build')
  ?.file?.patch(JsonPatch.remove('/jobs/package-python/steps/1'));
project.synth();
