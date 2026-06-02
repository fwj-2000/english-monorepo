import { useUserStore } from "@/stores/user"
import { useLoginDialogStore } from "@/stores/loginDialog"

export const useLogin = () => {
  const showLogin = useLoginDialogStore((s) => s.show)
  const hideLogin = useLoginDialogStore((s) => s.hide)
  const user = useUserStore((s) => s.user)
  const logoutStore = useUserStore((s) => s.logout)

  const login = () => {
    return new Promise<void>((resolve, reject) => {
      if (user) {
        resolve()
      } else {
        showLogin()
        reject()
      }
    })
  }

  const logout = () => {
    logoutStore()
    window.location.href = "/"
  }

  return { login, hide: hideLogin, logout }
}
