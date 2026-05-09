import { Module } from "@medusajs/framework/utils"
import AiModuleService from "./service.ts"

export const AI_MODULE = "ai"

export default Module(AI_MODULE, {
  service: AiModuleService,
})
