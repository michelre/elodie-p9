/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from '../__mocks__/store.js'
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
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
        document, onNavigate, store, localStorage: window.localStorage
      })
      const event = {
        preventDefault: () => {},
        target: {
          value: ''
        }
      }
      const create = jest.fn().mockImplementation(() => {
        return Promise.resolve({fileUrl: '', key: ''})
      })
      store.bills = jest.fn().mockImplementation(() => {
        return {
          create
        }
      })
      const file = new File(['hello'], 'hello.png', {type: 'image/png'})
      const input = screen.getByTestId('file')
      userEvent.upload(input, file)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('email', 'employee@test.tld')
      // Exectute
      newbill.handleChangeFile(event)

      // Assertion
      expect(create).toHaveBeenCalled()
    })
  })
})
