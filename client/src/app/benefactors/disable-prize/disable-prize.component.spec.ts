import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisablePrizeComponent } from './disable-prize.component';

describe('DisablePrizeComponent', () => {
  let component: DisablePrizeComponent;
  let fixture: ComponentFixture<DisablePrizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisablePrizeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisablePrizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
