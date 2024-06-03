import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisablePickpointComponent } from './disable-pickpoint.component';

describe('DisablePickpointComponent', () => {
  let component: DisablePickpointComponent;
  let fixture: ComponentFixture<DisablePickpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisablePickpointComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisablePickpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
