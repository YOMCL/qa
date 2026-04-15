interface Applier<TTarget, TApplicator, TResult> {
  apply(target: TTarget, applicator: TApplicator): TResult;
  applyAll(target: TTarget, applicators: Array<TApplicator>): TResult;
}

export default Applier;
