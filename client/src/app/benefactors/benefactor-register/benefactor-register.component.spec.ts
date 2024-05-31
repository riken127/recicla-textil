import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefactorRegisterComponent } from './benefactor-register.component';

describe('BenefactorRegisterComponent', () => {
  let component: BenefactorRegisterComponent;
  let fixture: ComponentFixture<BenefactorRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenefactorRegisterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BenefactorRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
