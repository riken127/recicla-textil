import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWaitingDonationsComponent } from './list-waiting-donations.component';

describe('ListWaitingDonationsComponent', () => {
  let component: ListWaitingDonationsComponent;
  let fixture: ComponentFixture<ListWaitingDonationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListWaitingDonationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListWaitingDonationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
