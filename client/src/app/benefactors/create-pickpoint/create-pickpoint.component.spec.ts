import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePickpointComponent } from './create-pickpoint.component';

describe('CreatePickpointComponent', () => {
  let component: CreatePickpointComponent;
  let fixture: ComponentFixture<CreatePickpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePickpointComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePickpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
