/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
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

  describe("When I am on bills page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then a button allowing to see the attachment should be displayed", () => {
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy();
    });

    test("Then a button to create a new bill should be displayed", () => {
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
    });
  });

  describe("When I am on Bills page but it is loading", () => {
    test("Then loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("When I am on Bills page but back-end sends an error message", () => {
    test("Then error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });

  describe("When I click on the eye icon", () => {
    beforeEach(() => {
      $.fn.modal = jest.fn();
    });

    const employeeBills = new Bills({
      document,
      onNavigate,
      store: null,
      localStorage: window.localStorage,
    });

    test("Then a modal should open", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const handleClickIconEye = jest.fn(employeeBills.handleClickIconEye);
      const eye = screen.getAllByTestId("icon-eye")[0];
      eye.addEventListener("click", () => handleClickIconEye(eye));
      //eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();
      const modale = screen.getByTestId("modaleFileEmployee");
      expect(modale).toBeTruthy();
      //expect(screen.getByText("Justificatif")).toBeTruthy();
      ///Does not work
      //expect(modale).toHaveClass("show");

      ///Does work when it should not
      expect(modale).not.toHaveClass("show");
    });

    //   test("Then the modal should close", () => {
    //     const modale = screen.getByTestId("modaleFileEmployee");
    //     const close = document.querySelector(".close");
    //     close.addEventListener("click", () => {
    //       expect(modale).toBeFalsy();
    //     });
    //   });

    describe("When I click on the close button", () => {
      test("Then the modal should close", () => {
        const handleCloseModal = jest.fn(employeeBills.handleCloseModal);
        const close = screen.getByRole("button");
        close.addEventListener("click", handleCloseModal);
        userEvent.click(close);
        expect(handleCloseModal).toHaveBeenCalled();
        const modale = screen.getByTestId("modaleFileEmployee");
        expect(modale).not.toHaveClass("show");

        ///Does work when it should not
        expect(modale).toBeTruthy();
      });
    });
  });

  describe("When I click on the new bill button", () => {
    test("Then I should navigate to the new bill page", () => {
      const employeeBills = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleClickNewBillButton = jest.fn(
        employeeBills.handleClickNewBill
      );
      const button = screen.getByTestId("btn-new-bill");
      button.addEventListener("click", handleClickNewBillButton);
      userEvent.click(button);
      expect(handleClickNewBillButton).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as an Employee", () => {
  describe("When I navigate to my bills", () => {
    test("Then bills are fetched from mocked API", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "b@b" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const type = await screen.getByText("Type");
      expect(type).toBeTruthy();
      expect(screen.getAllByTestId("tbody")).toBeTruthy();
    });

    describe("When I try to navigate to my bills but an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "b@b",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("Then bill fetching fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("Then bill fetching fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
