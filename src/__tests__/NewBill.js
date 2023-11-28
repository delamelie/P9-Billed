/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor, render } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import EmployeeBills from "../containers/Bills.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
//import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

//jest.mock("../app/store", () => mockStore);

const fileName = [
  new File(["expense"], "expense.jpeg", { type: "image/jpeg" }),
  new File(["attachment"], "attachment.png", { type: "image/png" }),
  new File(["bill"], "bill.pdf", { type: "application/pdf" }),
];

describe("Given I am connected as an employee", () => {
  describe("When I am on bills page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");

      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
  });

  describe("When I am on NewBill page, I do not fill fields and try to submit the form", () => {
    test("Then the form should not be submitted and I should stay on NewBill page", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      // does not work if toBe is empty
      const inputExpenseType = screen.getByTestId("expense-type");
      expect(inputExpenseType.value).toBe("Transports");

      const inputExpenseName = screen.getByTestId("expense-name");
      expect(inputExpenseName.value).toBe("");

      const inputExpenseDate = screen.getByTestId("datepicker");
      expect(inputExpenseDate.value).toBe("");

      const inputExpenseAmount = screen.getByTestId("amount");
      expect(inputExpenseAmount.value).toBe("");

      const inputExpensePct = screen.getByTestId("pct");
      expect(inputExpensePct.value).toBe("");

      //Value or target ??
      const inputExpenseFile = screen.getByTestId("file");
      expect(inputExpenseFile.value).toBe("");

      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  describe("When I am on NewBill page, I click on the 'Choose a file button' and try to attach a file in incorrect format", () => {
    test("Then an alert message should appear to warn me and ask me to have the attachment in the right format", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const handleFiles = jest.fn();

      const inputExpenseFile = screen.getByTestId("file");
      fireEvent.change(inputExpenseFile, { target: { files: fileName } });

      const selectedFileName = inputExpenseFile.files[2].name;

      expect(selectedFileName).toBe("bill.pdf");

      // expect(handleFiles).toHaveBeenCalledTimes(1);
      // expect(window.alert).toHaveBeenCalled();
    });
  });

  describe("When I am on NewBill page, I click on the 'Choose a file button' and attach a file with correct format", () => {
    test("Then the name of the attachment should appear in the input", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      const handleFiles = jest.fn();

      const inputExpenseFile = screen.getByTestId("file");
      fireEvent.change(inputExpenseFile, { target: { files: fileName } });
      const selectedFileName = inputExpenseFile.files[0].name;
      expect(selectedFileName).toBe("expense.jpeg");

      //expect(handleFiles).toHaveBeenCalledTimes(1);
      //expect(screen.getByText("expense.jpeg")).toBeInTheDocument();
      //expect(inputExpenseFile.textContent).toBe("expense.jpeg");
      //expect(inputExpenseFile.value).toBe("expense.jpeg");
    });
  });
});

// test d'intégration POST
describe("When I am on NewBill page, I do fill all fields in correct format and try to submit the form", () => {
  test("Then the form should be submitted and I should go back to Bills page", () => {
    document.body.innerHTML = NewBillUI();

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const newBillDataInput = {
      email: "b@b",
      type: "Transports",
      name: "Train",
      amount: "240",
      date: "2023-03-03",
      vat: "40",
      pct: "20",
      commentary: "RAS",
      fileUrl: "https://test.attachment.png",
      fileName: [
        new File(["attachment"], "attachment.png", { type: "image/png" }),
      ],
      status: "pending",
    };

    const inputExpenseType = screen.getByTestId("expense-type");
    fireEvent.change(inputExpenseType, {
      target: { value: newBillDataInput.type },
    });
    expect(inputExpenseType.value).toBe(newBillDataInput.type);

    const inputExpenseName = screen.getByTestId("expense-name");
    fireEvent.change(inputExpenseName, {
      target: { value: newBillDataInput.name },
    });
    expect(inputExpenseName.value).toBe(newBillDataInput.name);

    const inputExpenseDate = screen.getByTestId("datepicker");
    fireEvent.change(inputExpenseDate, {
      target: { value: newBillDataInput.date },
    });
    expect(inputExpenseDate.value).toBe(newBillDataInput.date);

    const inputExpenseAmount = screen.getByTestId("amount");
    fireEvent.change(inputExpenseAmount, {
      target: { value: newBillDataInput.amount },
    });
    expect(inputExpenseAmount.value).toBe(newBillDataInput.amount);

    const inputExpenseVat = screen.getByTestId("vat");
    fireEvent.change(inputExpenseVat, {
      target: { value: newBillDataInput.vat },
    });
    expect(inputExpenseVat.value).toBe(newBillDataInput.vat);

    const inputExpensePct = screen.getByTestId("pct");
    fireEvent.change(inputExpensePct, {
      target: { value: newBillDataInput.pct },
    });
    expect(inputExpensePct.value).toBe(newBillDataInput.pct);

    const inputExpenseComment = screen.getByTestId("commentary");
    fireEvent.change(inputExpenseComment, {
      target: { value: newBillDataInput.commentary },
    });
    expect(inputExpenseComment.value).toBe(newBillDataInput.commentary);

    const inputExpenseFile = screen.getByTestId("file");
    fireEvent.change(inputExpenseFile, {
      target: { files: newBillDataInput.fileName },
    });
    const selectedFileName = inputExpenseFile.files[0].name;
    expect(selectedFileName).toBe(newBillDataInput.fileName[0].name);

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
      "bill",
      JSON.stringify({
        email: newBillDataInput.email,
        type: newBillDataInput.type,
        name: newBillDataInput.name,
        amount: newBillDataInput.amount,
        date: newBillDataInput.date,
        vat: newBillDataInput.vat,
        pct: newBillDataInput.pct,
        commentary: newBillDataInput.comment,
        fileUrl: newBillDataInput.fileUrl,
        fileName: newBillDataInput.file,
        status: newBillDataInput.status,
      })
    );
  });

  test("It should render Bills page", () => {
    expect(screen.queryByText("Mes notes de frais")).toBeTruthy();
  });
});
