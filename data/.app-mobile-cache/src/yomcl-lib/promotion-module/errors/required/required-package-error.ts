import RequiredError from './required-error';

class RequiredPackageError extends RequiredError {
  constructor(packageName: string) {
    super(`"${packageName}" key in packages`);
  }
}

export default RequiredPackageError;
