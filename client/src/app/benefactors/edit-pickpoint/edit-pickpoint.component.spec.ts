import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPickpointComponent } from './edit-pickpoint.component';

describe('EditPickpointComponent', () => {
  let component: EditPickpointComponent;
  let fixture: ComponentFixture<EditPickpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPickpointComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPickpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
