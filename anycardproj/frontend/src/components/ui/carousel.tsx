import * as React from "react"
import { Carousel as MantineCarousel } from "@mantine/carousel"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export type CarouselApi = {
  scrollNext: () => void
  scrollPrev: () => void
  scrollTo: (index: number) => void
  selectedScrollSnap: () => number
  scrollSnapList: () => number[]
  on: (event: string, callback: () => void) => void
  off: (event: string, callback: () => void) => void
}

export type CarouselProps = ComponentProps<typeof MantineCarousel> & {
  setApi?: (api: CarouselApi | undefined) => void
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  CarouselProps
>(({ className, setApi, ...props }, ref) => {
  const handleGetEmblaApi = React.useCallback((emblaApi: any) => {
    if (emblaApi && setApi) {
      const api: CarouselApi = {
        scrollNext: () => emblaApi.scrollNext(),
        scrollPrev: () => emblaApi.scrollPrev(),
        scrollTo: (index: number) => emblaApi.scrollTo(index),
        selectedScrollSnap: () => emblaApi.selectedScrollSnap(),
        scrollSnapList: () => emblaApi.scrollSnapList(),
        on: (event: string, callback: () => void) => {
          emblaApi.on(event, callback)
        },
        off: (event: string, callback: () => void) => {
          emblaApi.off(event, callback)
        },
      }
      setApi(api)
    }
  }, [setApi])

  return (
    <MantineCarousel
      ref={ref}
      className={cn("w-full", className)}
      getEmblaApi={handleGetEmblaApi}
      {...props}
    />
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex", className)}
    {...props}
  />
))
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <MantineCarousel.Slide
    ref={ref}
    className={cn("min-w-0 shrink-0", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

export { Carousel, CarouselContent, CarouselItem }

