    const dragAndDrop = (listWrap, list, option) => {
        list ??= "& > *"

        const optionDefault = {
            verticalDirection: true,
            dropEvent: () => {},
            changeEvent: () => {},
        }
        option = {
            ...optionDefault,
            ...option
        }

        document.head.insertAdjacentHTML("beforeend", `<style>
            ${listWrap} .dragging {
                box-shadow: 0px 0px 1px 1px rgb(181, 234, 255);
                border: 1px solid rgb(216, 216, 255);
                background: rgb(239, 249, 255);
            }
            ${listWrap} .waterB:not(.dragging) {animation: waterB .15s;}
            ${listWrap} .waterT:not(.dragging) {animation: waterT .15s;}
            @keyframes waterB {
                0% {translate: 0 -30%;}
                100% {translate: 0 10%;}
            }
            @keyframes waterT {
                0% {translate: 0 30%;}
                100% {translate: 0 -10%;}
            }
            ${listWrap} .slideT {animation: slideT .2s;}
            @keyframes slideT {100% {translate: 0 -100%;}}
            ${listWrap} .slideB {animation: slideB .2s;}
            @keyframes slideB {100% {translate: 0 100%;}}
            ${listWrap} .slideL {animation: slideL .2s;}
            @keyframes slideL {100% {translate: 100% 0;}}
            ${listWrap} .slideR {animation: slideR .2s;}
            @keyframes slideR {100% {translate: -100% 0;}}
            
            ${listWrap} .waterR:not(.dragging) {animation: waterR .15s;}
            ${listWrap} .waterL:not(.dragging) {animation: waterL .15s;}
            @keyframes waterR {
                0% {translate: 30% 0;}
                100% {translate: -10% 0;}
            }
            @keyframes waterL {
                0% {translate: -30% 0;}
                100% {translate: 10% 0;}
            }
        </style>`)
        document.body.insertAdjacentHTML("afterbegin", `
        `)

        const listWrapArray = document.querySelectorAll(listWrap)

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

        let swap = false
        listWrapArray.forEach(ul => {
            ul.querySelectorAll(list).forEach(li => {
                li.setAttribute("draggable", true)
                li.addEventListener("dragstart", e => li.classList.add("dragging"))
                li.addEventListener("dragend", e => li.classList.remove("dragging"))
                li.addEventListener("drop", e => option.dropEvent(e))
            })

            ul.addEventListener("dragover", e => {
                e.preventDefault()
                const element = getElement(ul, e)
                const now = document.querySelector(".dragging")
                const prevE = element ? element.previousElementSibling : ul.lastElementChild
                
                if(prevE == now) return
                else if(swap) return
                
                const waterDrop = () => {
                    const setClass = (element, className, index) => {
                        element.classList.add(className)
                        element.style.animationDelay = index * 0.05 + "s"
                        element.addEventListener("animationend", () => element.classList.remove(className) ?? (element.style.animationDelay = "0s"), {once: true})
                    }
                    let sibling = now.nextElementSibling
                    let siblingCount = 0
                    while(sibling) {
                        setClass(sibling, option.verticalDirection ? "waterB" : "waterR", siblingCount++)
                        sibling = sibling.nextElementSibling
                    }
                    sibling = now.previousElementSibling
                    siblingCount = 0
                    while(sibling) {
                        setClass(sibling, option.verticalDirection ? "waterT" : "waterL", siblingCount++)
                        sibling = sibling.previousElementSibling
                    }
                }
                
                const nowWrap = now.closest(listWrap)
                const elementWrap = document.elementFromPoint(e.x, e.y).closest(listWrap)
                if(nowWrap != elementWrap) {
                    element === false ? elementWrap.appendChild(now) : element.before(now)
                    waterDrop()
                }
                
                const nowRect = now.getBoundingClientRect()
                const nowPoint = option.verticalDirection ? nowRect.y + nowRect.height / 2 : nowRect.x + nowRect.width / 2
                const direction = (option.verticalDirection ? e.y : e.x) > nowPoint
                if(nowRect[option.verticalDirection ? "height" : "width"] / 2 > Math.abs(nowPoint - e[option.verticalDirection ? "y" : "x"])) return

                const slideB = option.verticalDirection ? "slideB" : "slideL"
                const slideT = option.verticalDirection ? "slideT" : "slideR"
                const slide = () => {
                    if(direction && now.nextElementSibling) {
                        now.classList.remove(slideB)
                        now.nextElementSibling.classList.remove(slideT)
                        now.nextElementSibling.after(now)
                    } else if(now.previousElementSibling) {
                        now.classList.remove(slideT)
                        now.previousElementSibling.classList.remove(slideB)
                        now.previousElementSibling.before(now)
                    }
                    option.changeEvent(e)
                    swap = false
                }
                swap = true
                if(direction && now.nextElementSibling) {
                    now.nextElementSibling.classList.add(slideT)
                    now.classList.add(slideB)
                } else if(now.previousElementSibling) {
                    now.previousElementSibling.classList.add(slideB)
                    now.classList.add(slideT)
                }
                now.addEventListener("animationend", slide, {once: true})
            })
        })
    }