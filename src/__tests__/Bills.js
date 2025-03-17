/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import store from "../__mocks__/store.js";

import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')

      expect(windowIcon.classList).toContain('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test('When I click on New Bill Button, it should trigger handleClickNewBill function', async () => {
      // Prepare
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('btn-new-bill'))
      const btnNewBill = screen.getByTestId('btn-new-bill')

      const billsContainer = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      const spy = jest.spyOn(billsContainer, 'handleClickNewBill')
      btnNewBill.addEventListener('click', billsContainer.handleClickNewBill)

      // Execution
      userEvent.click(btnNewBill)

      // Assertion
      expect(spy).toHaveBeenCalled()
    })
  })

  test('When I click on eye icon, it should trigger handleClickIconEye function', async () => {
    // Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
    document.body.innerHTML = BillsUI({ data: [{}] })
    await waitFor(() => screen.getByTestId('icon-eye'))
    const iconEye = screen.getByTestId('icon-eye')

    const billsContainer = new Bills({
      document, onNavigate, store, localStorage: window.localStorage
    })
    const spy = jest.spyOn(billsContainer, 'handleClickIconEye').mockImplementation(() => {})
    iconEye.addEventListener('click', billsContainer.handleClickIconEye)

    // Execution
    userEvent.click(iconEye)

    // Assertion
    expect(spy).toHaveBeenCalled()
  
  })

  test('When I call on handleClickIconEye, it should call $.modal function', async () => {
    // Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
  
    const billsContainer = new Bills({
      document, onNavigate, store, localStorage: window.localStorage
    })
    const modal = jest.fn()
    window.$ = () => {
      return {
        width: jest.fn(),
        find: jest.fn().mockImplementation(() => {
          return {
            html: jest.fn()
          }
        }),
        click: jest.fn(), //TODO: Voir mockRestore
        modal
      }      
    }
    
    const icon = {
      getAttribute: () => ''
    }

    // Execution
    billsContainer.handleClickIconEye(icon)

    // Assertion
    expect(modal).toHaveBeenCalled()
  
  })

  test('When I call on getBills, it should return a well formed array of bills', async () => {
    // Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee'
    }))
  
    const billsContainer = new Bills({
      document, onNavigate, store, localStorage: window.localStorage
    })

    // Execution
    const bills = billsContainer.getBills()

    // Assertion
    expect(bills).toBeInstanceOf(Promise)
    expect(bills).resolves.toHaveLength(4)
  
  })

})
