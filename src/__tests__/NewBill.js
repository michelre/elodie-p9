/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import mockStore from '../__mocks__/store.js'
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import router from "../app/Router"

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  test("When I call handleChangeFile, it should call the create store function", () => {
    //Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld"
    }))
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const html = NewBillUI()
    document.body.innerHTML = html
    
    const newbill = new NewBill({
      document, onNavigate, store: mockStore, localStorage: window.localStorage
    })
    const event = {
      preventDefault: () => {},
      target: {
        value: ''
      }
    }
    const spyCreate = jest.spyOn(mockStore.bills(), 'create')
        
    const file = new File(['hello'], 'hello.png', {type: 'image/png'})
    const input = screen.getByTestId('file')
    userEvent.upload(input, file)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('email', 'employee@test.tld')
    // Exectute
    newbill.handleChangeFile(event)

    // Assertion
    expect(spyCreate).toHaveBeenCalled()
    spyCreate.mockRestore() // Bien penser à relâcher le mock pour éviter de créer un conflict pour les autres tests
  })
  test("When I upload a wrong file, it should display an error", () => {
    //Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld"
    }))
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const html = NewBillUI()
    document.body.innerHTML = html

    const newbill = new NewBill({
      document, onNavigate, store: mockStore, localStorage: window.localStorage
    })
    const event = {
      preventDefault: () => {},
      target: {
        value: ''
      }
    }
    
    const file = new File(['hello'], 'hello.pdf', {type: 'application/pdf'})
    const input = screen.getByTestId('file')
    userEvent.upload(input, file)
  
    // Exectute
    newbill.handleChangeFile(event)

    // Assertion
    const errorElement = screen.queryByText('Veuillez sélectionner le bon format de fichier')
    expect(errorElement).toBeDefined()
  })
  test("When I call handleSubmit, updateBill function should be called", () => {
    //Prepare
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "employee@test.tld"
    }))    
    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname })
    }

    const html = NewBillUI()
    document.body.innerHTML = html

    const newbill = new NewBill({
      document, onNavigate, store: mockStore, localStorage: window.localStorage
    })


    const event = {
      preventDefault: () => {},
      target:  {
        querySelector: () => {
          return {value: ''}
        }
      }
    }

    const updateBillMock = jest.spyOn(newbill, 'updateBill').mockImplementation(() => {})    

    // Exectute
    newbill.handleSubmit(event)

    // Assertion    
    expect(updateBillMock).toHaveBeenCalled()
  })
})

// test d'intégration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I add a new bill", () => {    
    test("add a bill from mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));      

      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByText("Envoyer une note de frais"))

      const datePicker = screen.getByTestId('datepicker')
      userEvent.type(datePicker, '01/01/2011')

      const amount = screen.getByTestId('amount')
      userEvent.type(amount, '348')

      const pct = screen.getByTestId('pct')
      userEvent.type(pct, '20')

      const file = new File(['hello'], 'hello.png', {type: 'image/png'})
      const input = screen.getByTestId('file')
      userEvent.upload(input, file)

      const form = screen.getByText('Envoyer')
      userEvent.click(form)
      
      await waitFor(() => screen.getByText(`Mes notes de frais`) )
      expect(screen.getByText(`Mes notes de frais`)).toBeTruthy()
    })
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("add a bill from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.resolve({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'})
          },
          update : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);

      const expanseName = screen.getByTestId('expense-name')
      userEvent.type(expanseName, 'test-integration')

      const datePicker = screen.getByTestId('datepicker')
      userEvent.type(datePicker, '01/01/2011')

      const amount = screen.getByTestId('amount')
      userEvent.type(amount, '348')

      const pct = screen.getByTestId('pct')
      userEvent.type(pct, '20')

      const file = new File(['hello'], 'hello.png', {type: 'image/png'})
      const input = screen.getByTestId('file')
      userEvent.upload(input, file)

      const form = screen.getByText('Envoyer')
      userEvent.click(form)

      
      /* On assert que la facture n'a pas été créée */
      await waitFor(() => screen.getAllByText("Mes notes de frais"))
      expect(screen.queryByText("test-integration")).not.toBeTruthy()
    })
    test("add a bill from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          create : () =>  {
            return Promise.resolve({fileUrl: 'https://localhost:3456/images/test.jpg', key: '1234'})
          },
          update : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.NewBill)
      await new Promise(process.nextTick);

      const expanseName = screen.getByTestId('expense-name')
      userEvent.type(expanseName, 'test-integration')

      const datePicker = screen.getByTestId('datepicker')
      userEvent.type(datePicker, '01/01/2011')

      const amount = screen.getByTestId('amount')
      userEvent.type(amount, '348')

      const pct = screen.getByTestId('pct')
      userEvent.type(pct, '20')

      const file = new File(['hello'], 'hello.png', {type: 'image/png'})
      const input = screen.getByTestId('file')
      userEvent.upload(input, file)

      const form = screen.getByText('Envoyer')
      userEvent.click(form)

      
      //On assert que la facture n'a pas été créée 
      await waitFor(() => screen.getAllByText("Mes notes de frais"))
      expect(screen.queryByText("test-integration")).not.toBeTruthy()
    })
  })

  })
})
