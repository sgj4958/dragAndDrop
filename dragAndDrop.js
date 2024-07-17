    const dragAndDrop = (listWrap, list, option) => {

        const optionDefault = {
            verticalDirection: true,
            dropEvent: () => {},
            changeEvent: () => {},
        }
        option = {
            ...optionDefault,
            ...option
        }

        // const id = `customId_No${Math.floor(Math.random() * 10e5)}`
        document.head.insertAdjacentHTML("beforeend", `<style>
        .dragging {
            box-shadow: 0px 0px 1px 1px rgb(181, 234, 255);
            border: 1px solid rgb(216, 216, 255);
            background: rgb(239, 249, 255);
        }
        .slideBottom:not(.dragging) {
            animation: slideBottom .15s;
        }
        .slideTop:not(.dragging) {
            animation: slideTop .15s;
        }
        @keyframes slideBottom {
            0% {translate: 0 -30%;}
            100% {translate: 0 10%;}
        }
        @keyframes slideTop {
            0% {translate: 0 30%;}
            100% {translate: 0 -10%;}
        }
        </style>`)
        // document.body.insertAdjacentHTML("afterbegin", `
        // `)

        // const customWrap = document.querySelector("body")
        // const modalCustom = customWrap.querySelector(`#${id}`)

        const ul = document.querySelectorAll(listWrap)
        const li = document.querySelectorAll(listWrap + (list ?? " > *"))
        li.forEach(e => e.setAttribute("draggable", true))

        const getElement = (ul, cursor) => {
            const liArray = [...ul.querySelectorAll("li:not(.dragging)")]
            const pointArray = liArray.map(li => {
                const rect = li.getBoundingClientRect()
                return option.verticalDirection ? (rect.y + rect.height / 2) : (rect.x + rect.width / 2)
            })
            for(const [index, item] of pointArray.entries()) {
                if(item > cursor[option.verticalDirection ? "y" : "x"]) return liArray[index]
            }
            return false
        }
        
        li.forEach(e => {
            e.addEventListener("dragstart", () => e.classList.add("dragging"))
            e.addEventListener("dragend", () => e.classList.remove("dragging"))
            e.addEventListener("drop", e => option.dropEvent(e))
        })

        let beforeElement
        ul.forEach(ul => {
            ul.addEventListener("dragover", e => {
                e.preventDefault()
                const element = getElement(ul, e)
                
                if(beforeElement == element) return
                beforeElement = element
                option.changeEvent(e)
                const now = document.querySelector(".dragging")

                if(element === false) ul.appendChild(now)
                else element.before(now)

                const setClass = (element, className, index) => {
                    element.classList.add(className)
                    element.style.animationDelay = index * 0.05 + "s"
                    const deleteDragAni = () => {
                        element.classList.remove(className)
                        element.removeEventListener("transitionend", deleteDragAni)
                        element.removeEventListener("animationend", deleteDragAni)
                    }
                    element.addEventListener("transitionend", deleteDragAni)
                    element.addEventListener("animationend", deleteDragAni)
                }
                let sibling = now.nextElementSibling
                let siblingCount = 0
                while(sibling) {
                    setClass(sibling, "slideTop", siblingCount++)
                    sibling = sibling.nextElementSibling
                }
                sibling = now.previousElementSibling
                siblingCount = 0
                while(sibling) {
                    setClass(sibling, "slideBottom", siblingCount++)
                    sibling = sibling.previousElementSibling
                }
            })
        })
    }