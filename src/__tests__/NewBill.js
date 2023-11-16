// /**
//  * @jest-environment jsdom
//  */

// import { screen } from "@testing-library/dom";
// import NewBillUI from "../views/NewBillUI.js";
// import NewBill from "../containers/NewBill.js";

// describe("Given I am connected as an employee", () => {
//   describe("When I am on NewBill Page", () => {
//     test("Then ...", () => {
//       const html = NewBillUI();
//       document.body.innerHTML = html;
//       //to-do write assertion
//     });
//   });
// });

/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import EmployeeBills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });
  });

  describe("When I am on NewBill page, I do not fill fields and try to submit the form", () => {
    test("Then the form should not be submitted and I should stay on NewBill page", () => {
      document.body.innerHTML = NewBillUI();

      // const inputExpenseType = screen.getByTestId("expense-type");
      // expect(inputExpenseType.value).toBe("");

      const inputExpenseName = screen.getByTestId("expense-name");
      expect(inputExpenseName.value).toBe("");

      const inputExpenseDate = screen.getByTestId("datepicker");
      expect(inputExpenseDate.value).toBe("");

      const inputExpenseAmount = screen.getByTestId("amount");
      expect(inputExpenseAmount.value).toBe("");

      const inputExpensePct = screen.getByTestId("pct");
      expect(inputExpensePct.value).toBe("");

      const inputExpenseFile = screen.getByTestId("file");
      expect(inputExpenseFile.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });
});

describe("When I am on NewBill page, I do fill fields but try to attach a file in incorrect format and try to submit the form", () => {
  test("Then the form should not be submitted and I should stay on NewBill page", () => {
    document.body.innerHTML = NewBillUI();

    // const inputExpenseType = screen.getByTestId("expense-type");
    //fireEvent.change(inputExpenseType, { target: { value: "Avion" } });
    // expect(inputExpenseType.value).toBe("");

    const inputExpenseName = screen.getByTestId("expense-name");
    fireEvent.change(inputExpenseName, { target: { value: "Avion" } });
    expect(inputExpenseName.value).toBe("Avion");

    // const inputExpenseDate = screen.getByTestId("datepicker");
    // fireEvent.change(inputExpenseDate, { target: { value: "12/12/2022" } });
    // expect(inputExpenseDate.value).toBe("12/12/2022");

    const inputExpenseAmount = screen.getByTestId("amount");
    fireEvent.change(inputExpenseAmount, { target: { value: "248" } });
    expect(inputExpenseAmount.value).toBe("248");

    const inputExpensePct = screen.getByTestId("pct");
    fireEvent.change(inputExpensePct, { target: { value: "20" } });
    expect(inputExpensePct.value).toBe("20");

    // const inputExpenseFile = screen.getByTestId("file");
    // fireEvent.change(inputExpenseFile, { target: { value: "Avion" } });
    // expect(inputExpenseFile.value).toBe("");

    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn((e) => e.preventDefault());

    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    expect(screen.getByTestId("form-new-bill")).toBeTruthy();
  });
});

describe("When I am on NewBill page, I do fill all fields in correct format and try to submit the form", () => {
  test("Then the form should be submitted and I should go back to Bills page", () => {
    document.body.innerHTML = NewBillUI();
    const newBillData = {
      type: "Transports",
      name: "Train",
      date: "16/03/2023",
      amount: "240",
      vat: "40",
      pct: "20",
      comment: "RAS",
      file: "justif.jpg",
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    // const inputExpenseType = screen.getByTestId("expense-type");
    //fireEvent.change(inputExpenseType, { target: { value: newBillData.type } });
    // expect(inputExpenseType.value).toBe(newBillData.type);

    const inputExpenseName = screen.getByTestId("expense-name");
    fireEvent.change(inputExpenseName, { target: { value: newBillData.name } });
    expect(inputExpenseName.value).toBe(newBillData.name);

    // const inputExpenseDate = screen.getByTestId("datepicker");
    // fireEvent.change(inputExpenseDate, { target: { value: newBillData.date } });
    // expect(inputExpenseDate.value).toBe(newBillData.date);

    const inputExpenseAmount = screen.getByTestId("amount");
    fireEvent.change(inputExpenseAmount, {
      target: { value: newBillData.amount },
    });
    expect(inputExpenseAmount.value).toBe(newBillData.amount);

    const inputExpenseVat = screen.getByTestId("vat");
    fireEvent.change(inputExpenseVat, { target: { value: newBillData.vat } });
    expect(inputExpenseVat.value).toBe(newBillData.vat);

    const inputExpensePct = screen.getByTestId("pct");
    fireEvent.change(inputExpensePct, { target: { value: newBillData.pct } });
    expect(inputExpensePct.value).toBe(newBillData.pct);

    const inputExpenseComment = screen.getByTestId("commentary");
    fireEvent.change(inputExpenseComment, {
      target: { value: newBillData.comment },
    });
    expect(inputExpenseComment.value).toBe(newBillData.comment);

    // const inputExpenseFile = screen.getByTestId("file");
    // fireEvent.change(inputExpenseFile, { target: { value: newBillData.file } });
    // expect(inputExpenseFile.value).toBe(newBillData.file);

    const form = screen.getByTestId("form-new-bill");

    // localStorage should be populated with form data
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });

    // we have to mock navigation to test it
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };

    let PREVIOUS_LOCATION = "";

    const store = jest.fn();

    const newBill = new NewBill({
      document,
      localStorage: window.localStorage,
      onNavigate,
      PREVIOUS_LOCATION,
      store,
    });

    const handleSubmitNewBill = jest.fn(newBill.handleSubmit);
    newBill.newBill = jest.fn().mockResolvedValue({});
    form.addEventListener("submit", handleSubmitNewBill);
    fireEvent.submit(form);
    expect(handleSubmitNewBill).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "testBill",
      JSON.stringify({
        type: newBillData.type,
        name: newBillData.name,
        date: newBillData.date,
        amount: newBillData.amount,
        vat: newBillData.vat,
        pct: newBillData.pct,
        comment: newBillData.comment,
        file: newBillData.file,
      })
    );
  });

  test("It should render Bills page", () => {
    expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
  });
});
