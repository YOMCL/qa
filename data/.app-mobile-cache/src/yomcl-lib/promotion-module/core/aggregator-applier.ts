import type Applier from '../types/applier';

abstract class AggregatorApplier<TTarget, TApplicator, TResult> implements Applier<TTarget, TApplicator, Array<TResult>> {
  #results: Array<TResult> = [];

  get results(): Array<TResult> {
    return this.#results;
  }

  resetResult(): void {
    this.#results = [];
  }
  
  applyAll(target: TTarget, applicators: Array<TApplicator>): Array<TResult> {
    this.resetResult();
    for(const applicator of applicators) {
      this.results.push(...this.apply(target, applicator));
    }
    
    return this.results;
  }
  
  
  abstract apply(target: TTarget, applicator: TApplicator): Array<TResult>;
}

export default AggregatorApplier;
