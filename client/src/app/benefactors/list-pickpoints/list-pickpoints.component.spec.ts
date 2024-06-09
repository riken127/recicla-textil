import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPickpointsComponent } from './list-pickpoints.component';

describe('ListPickpointsComponent', () => {
  let component: ListPickpointsComponent;
  let fixture: ComponentFixture<ListPickpointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPickpointsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListPickpointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
