import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAmendeComponent } from './list-amende.component';

describe('ListAmendeComponent', () => {
  let component: ListAmendeComponent;
  let fixture: ComponentFixture<ListAmendeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAmendeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAmendeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
