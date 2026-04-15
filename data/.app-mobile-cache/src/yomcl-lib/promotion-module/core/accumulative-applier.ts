import type Applier from '../types/applier';

abstract class AccumulativeApplier<TTarget, TApplicator, TResult extends TTarget> implements Applier<TTarget, TApplicator, TResult> {
  #result?: TResult;

  get result(): TResult {
    return this.#result as TResult;
  }

  resetResult(): void {
    this.#result = undefined;
  }
  
  applyAll(target: TTarget, applicators: Array<TApplicator>): TResult {
    this.resetResult();
    this.#result = target as TResult;
    for(const applicator of applicators) {
      this.#result = this.apply(this.result, applicator);
    }
    
    return this.result;
  }
  
  
  abstract apply(target: TTarget, applicator: TApplicator): TResult;
}

export default AccumulativeApplier;
