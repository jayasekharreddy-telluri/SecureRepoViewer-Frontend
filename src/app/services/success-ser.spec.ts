import { TestBed } from '@angular/core/testing';

import { SuccessSer } from './success-ser';

describe('SuccessSer', () => {
  let service: SuccessSer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SuccessSer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
