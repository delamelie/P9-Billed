/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Newbill page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
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

    test("Then, there should be several form inputs in the page", () => {
      expect(screen.getByText("Type de dépense")).toBeTruthy();
      expect(screen.getByText("Nom de la dépense")).toBeTruthy();
      expect(screen.getByText("Date")).toBeTruthy();
      expect(screen.getByText("Montant TTC")).toBeTruthy();
      expect(screen.getByText("TVA")).toBeTruthy();
      expect(screen.getByText("Commentaire")).toBeTruthy();
      expect(screen.getByText("Justificatif")).toBeTruthy();
    });

    test("Then a button to submit the new bill should be displayed", () => {
      expect(screen.getByRole("button")).toBeTruthy();
    });
  });

  describe("When I am on NewBill page, I do not fill fields and try to submit the form", () => {
    test("Then the form should not be submitted and I should stay on NewBill page", () => {
      document.body.innerHTML = NewBillUI();

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
    test("Then an alert message should appear to warn me and ask me to have the attachment in the right format", () => {
      //document.body.innerHTML = NewBillUI();

      const store = jest.fn();
      const newBill = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store,
      });

      window.alert = jest.fn();

      const handleFiles = jest.fn(newBill.handleChangeFile);
      const inputExpenseFile = screen.getByTestId("file");
      inputExpenseFile.addEventListener("change", handleFiles);

      const fileName = new File(["bill"], "bill.pdf", {
        type: "application/pdf",
      });

      fireEvent.change(inputExpenseFile, { target: { files: [fileName] } });
      expect(handleFiles).toHaveBeenCalled();
      const selectedFileName = inputExpenseFile.files[0].name;
      expect(selectedFileName).toBe("bill.pdf");
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe("When I am on NewBill page, I click on the 'Choose a file button' and attach a file with correct format", () => {
    test("Then the name of the attachment should appear in the input", async () => {
      document.body.innerHTML = NewBillUI();

      const store = jest.fn();
      const newBill = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
        store,
      });

      window.alert = jest.fn();

      const handleFiles = jest.fn(newBill.handleChangeFile);
      const inputExpenseFile = screen.getByTestId("file");
      inputExpenseFile.addEventListener("change", handleFiles);

      const fileName = new File(["expense"], "expense.jpeg", {
        type: "image/jpeg",
      });

      fireEvent.change(inputExpenseFile, { target: { files: [fileName] } });
      expect(handleFiles).toHaveBeenCalled();
      const selectedFileName = inputExpenseFile.files[0].name;
      expect(selectedFileName).toBe("expense.jpeg");
      //expect(window.alert).not.toHaveBeenCalled();
      //expect(inputExpenseFile.value).toBe("expense.jpeg");
      //expect(screen.getByText("expense.jpeg")).toBeInTheDocument();
      //expect(inputExpenseFile.textContent).toBe("expense.jpeg");
    });
  });
});

// test d'intégration POST
describe("Given I am a user connected as an Employee", () => {
  describe("When I am on NewBill page, I do fill all fields in correct format and submit the form", () => {
    test("Then the data should be sent to the mocked API and I should go back to Bills page", () => {
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

      const store = jest.fn();

      const newBill = new NewBill({
        document,
        localStorage: window.localStorage,
        onNavigate,
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
});

// describe("Given I am a user connected as an Employee", () => {
//   describe("When I navigate to my bills", () => {
//     test("Then bills are fetched from mocked API", async () => {
//       localStorage.setItem(
//         "user",
//         JSON.stringify({ type: "Employee", email: "b@b" })
//       );
//       const root = document.createElement("div");
//       root.setAttribute("id", "root");
//       document.body.append(root);
//       router();
//       window.onNavigate(ROUTES_PATH.Bills);
//       await waitFor(() => screen.getByText("Mes notes de frais"));
//       const type = await screen.getByText("Type");
//       expect(type).toBeTruthy();
//       expect(screen.getAllByTestId("tbody")).toBeTruthy();
//     });

//     describe("When I try to navigate to my bills but an error occurs on API", () => {
//       beforeEach(() => {
//         jest.spyOn(mockStore, "bills");
//         Object.defineProperty(window, "localStorage", {
//           value: localStorageMock,
//         });
//         window.localStorage.setItem(
//           "user",
//           JSON.stringify({
//             type: "Employee",
//             email: "b@b",
//           })
//         );
//         const root = document.createElement("div");
//         root.setAttribute("id", "root");
//         document.body.appendChild(root);
//         router();
//       });
//       test("Then bill fetching fails with 404 message error", async () => {
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             list: () => {
//               return Promise.reject(new Error("Erreur 404"));
//             },
//           };
//         });
//         window.onNavigate(ROUTES_PATH.Bills);
//         await new Promise(process.nextTick);
//         const message = await screen.getByText(/Erreur 404/);
//         expect(message).toBeTruthy();
//       });

//       test("Then bill fetching fails with 500 message error", async () => {
//         mockStore.bills.mockImplementationOnce(() => {
//           return {
//             list: () => {
//               return Promise.reject(new Error("Erreur 500"));
//             },
//           };
//         });

//         window.onNavigate(ROUTES_PATH.Bills);
//         await new Promise(process.nextTick);
//         const message = await screen.getByText(/Erreur 500/);
//         expect(message).toBeTruthy();
//       });
//     });
//   });
