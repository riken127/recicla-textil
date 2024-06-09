import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPrizesComponent } from './all-prizes.component';

describe('AllPrizesComponent', () => {
  let component: AllPrizesComponent;
  let fixture: ComponentFixture<AllPrizesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPrizesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllPrizesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
