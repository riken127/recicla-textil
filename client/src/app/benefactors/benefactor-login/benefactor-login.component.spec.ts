import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefactorLoginComponent } from './benefactor-login.component';

describe('BenefactorLoginComponent', () => {
  let component: BenefactorLoginComponent;
  let fixture: ComponentFixture<BenefactorLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenefactorLoginComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BenefactorLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
