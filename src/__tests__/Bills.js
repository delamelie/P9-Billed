/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";
import BillsUI from "../views/BillsUI.js";
import userEvent from "@testing-library/user-event";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import EmployeeBills from "../containers/Bills.js";
import mockStore from "../__mocks__/store";

jest.mock("../app/store", () => mockStore);

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
  });

  // Ajout de test clic pour créer nouvelle note de frais
  describe("When I click on the new bill button", () => {
    test("Then it should navigate to the new bill page", () => {
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

      const employeeBills = new EmployeeBills({
        document,
        onNavigate,
        store: null,
        bills: bills,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: { bills } });

      const onNavigateSpy = jest.spyOn(employeeBills, "onNavigate");
      const button = screen.getByTestId("btn-new-bill");
      userEvent.click(button);
      expect(onNavigateSpy).toHaveBeenCalledWith("/NewBill");
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
    });
  });

  // Ajout de test error et loading
  describe("When I am on Bills page but it is loading", () => {
    test("Then, Loading page should be rendered", () => {
      document.body.innerHTML = BillsUI({ loading: true });
      expect(screen.getAllByText("Loading...")).toBeTruthy();
    });
  });

  describe("When I am on Bills page but back-end send an error message", () => {
    test("Then, Error page should be rendered", () => {
      document.body.innerHTML = BillsUI({ error: "some error message" });
      expect(screen.getAllByText("Erreur")).toBeTruthy();
    });
  });
});

// Ajout test icône oeil
describe("Given I am connected as an employee to the bills page", () => {
  describe("When I click on the icon eye", () => {
    test("Then a modal should open", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      document.body.innerHTML = BillsUI({ data: { bills } });
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const employeeBills = new EmployeeBills({
        document,
        onNavigate,
        store: null,
        bills,
        localStorage: window.localStorage,
      });

      const handleClickIconEye = jest.fn(employeeBills.handleClickIconEye);
      const eye = screen.getByTestId("icon-eye");
      eye.addEventListener("click", handleClickIconEye);
      userEvent.click(eye);
      expect(handleClickIconEye).toHaveBeenCalled();

      const modale = screen.getByTestId("modaleFileEmployee");
      expect(modale).toBeTruthy();
    });
  });
});

// test d'intégration GET
describe("Given I am a user connected as Employee3", () => {
  describe("When I navigate to my bills", () => {
    test("Bills from mocked API GET are fetched", async () => {
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

      //expect(screen.getByTestId("icon-eye")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
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
      test("fetches bills from an API and fails with 404 message error", async () => {
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

      test("fetches messages from an API and fails with 500 message error", async () => {
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
