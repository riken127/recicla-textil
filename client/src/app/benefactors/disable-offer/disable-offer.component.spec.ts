import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DisableOfferComponent} from './disable-offer.component';

describe('DisableOfferComponent', () => {
  let component: DisableOfferComponent;
  let fixture: ComponentFixture<DisableOfferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableOfferComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DisableOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
