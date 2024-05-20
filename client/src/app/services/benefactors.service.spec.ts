import { TestBed } from '@angular/core/testing';

import { BenefactorsService } from './benefactors.service';

describe('BenefactorsService', () => {
  let service: BenefactorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BenefactorsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
