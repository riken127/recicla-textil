import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPrizeComponent } from './edit-prize.component';

describe('EditPrizeComponent', () => {
  let component: EditPrizeComponent;
  let fixture: ComponentFixture<EditPrizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPrizeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPrizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
