import {Super} from './super'
import {Scroller} from 'scroller'
import {constants} from '../utils'

export class ScrollView  extends Super  {
  constructor (drawStyle) {
    super(drawStyle)
    this.scroller = null
    /**
     * Avoid duplication of creation using the same off screen canvas
     * @type {null}
     */
    this.mainInstance = null
    this.startHandler = this.startHandler || this.handleTouchStart.bind(this)
    this.moveHandler = this.moveHandler || this.handleTouchMove.bind(this)
    this.endHandler = this.endHandler || this.handleTouchEnd.bind(this)
  }

  draw (mainRender) {
    this.mainInstance = mainRender
    this.createScroller()
    this.updateScrollingDimensions()
    this.render = true
    constants.IN_BROWSER && this.removeListener()
    constants.IN_BROWSER && this.bindListener()
  }

  bindListener () {
    window.addEventListener('touchstart', this.startHandler)
    window.addEventListener('touchmove', this.moveHandler)
    window.addEventListener('touchend', this.endHandler)
  }

  removeListener () {
    window.removeEventListener('touchstart', this.startHandler)
    window.removeEventListener('touchmove', this.moveHandler)
    window.removeEventListener('touchend', this.endHandler)
  }

  handleTouchStart (e) {
    if (this.scroller) {
      this.scroller.doTouchStart(e.touches, e.timeStamp)
    }
  }

  handleTouchMove (e) {
    if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
      return;
    }
    if (this.scroller) {
      e.preventDefault()
      this.scroller.doTouchMove(e.touches, e.timeStamp, e.scale)
    }
  }

  handleTouchEnd (e) {
    if (this.scroller) {
      this.scroller.doTouchEnd(e.timeStamp)
    }
  }

  createScroller () {
    let options = {
      scrollingX: this.drawStyle.scrollingX === undefined ? false :this.drawStyle.scrollingX,
      scrollingY: this.drawStyle.scrollingY === undefined ? true :this.drawStyle.scrollingY
    }
    this.scroller = new Scroller(this.handleScroll.bind(this), options)
  }

  handleScroll (left, top) {
    /**
     * When rendering, it needs to scroll to the previous position.
     */
    constants.top = constants.scrollTop + top
    constants.scrollerTop = top
    this.mainInstance.rePaint(top)
  }

  updateScrollingDimensions () {
    this.scroller.setDimensions(
      this.width / constants.rate,
      this.height / constants.rate,
      this.width / constants.rate,
      this.drawStyle.scrollHeight * constants.rate
    )
    this.scroller.scrollTo(0, constants.scrollTop)
  }
}